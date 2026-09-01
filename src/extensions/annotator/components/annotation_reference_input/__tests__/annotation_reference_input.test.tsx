/** @jest-environment jsdom */

import React, { act } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Theme } from '@radix-ui/themes'

import {
    AnnotationReferenceInput
} from '..'
import {
    filterAnnotationReferenceCandidates,
    findAnnotationReferenceQuery
} from '../reference_query'
import {
    AnnotationType,
    PdfjsAnnotationType,
    type IAnnotationStore
} from '../../../const/definitions'

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { value?: number }) =>
            options?.value === undefined ? key : `${key}:${options.value}`
    })
}))

jest.mock('../../../utils/utils', () => ({
    formatPDFDate: (date: string | null) => date ? '07-28' : ''
}))

function makeAnnotation(
    id: string,
    referenceNumber: number,
    overrides: Partial<IAnnotationStore> = {}
): IAnnotationStore {
    return {
        id,
        referenceNumber,
        pageNumber: referenceNumber,
        konvaString: '{}',
        konvaClientRect: { x: 0, y: 0, width: 20, height: 20 },
        title: `Author ${referenceNumber}`,
        type: AnnotationType.RECTANGLE,
        color: '#000000',
        subtype: 'Square',
        pdfjsType: PdfjsAnnotationType.SQUARE,
        date: null,
        contentsObj: { text: `Annotation ${referenceNumber} summary` },
        comments: [],
        user: { id: `user-${referenceNumber}`, name: `Author ${referenceNumber}` },
        native: false,
        ...overrides
    }
}

const annotations = [
    makeAnnotation('annotation-1', 1),
    makeAnnotation('annotation-2', 2, {
        title: 'Alice',
        date: "D:20260728123000+08'00'"
    }),
    makeAnnotation('annotation-3', 3, {
        pageNumber: 8,
        subtype: 'Highlight',
        contentsObj: { text: 'Revenue needs review' }
    })
]

function renderInput(
    overrides: Partial<React.ComponentProps<typeof AnnotationReferenceInput>> = {}
) {
    const onSubmit = jest.fn()
    const onCancel = jest.fn()
    render(
        <Theme>
            <AnnotationReferenceInput
                annotations={annotations}
                excludeAnnotationId="annotation-1"
                onSubmit={onSubmit}
                onCancel={onCancel}
                {...overrides}
            />
        </Theme>
    )
    return {
        input: screen.getByRole('combobox') as HTMLTextAreaElement,
        onSubmit,
        onCancel
    }
}

describe('annotation reference input helpers', () => {
    it('finds an active query at the caret without triggering inside an ASCII word', () => {
        expect(findAnnotationReferenceQuery('See #Ali', 8)).toEqual({
            start: 4,
            end: 8,
            query: 'Ali'
        })
        expect(findAnnotationReferenceQuery('issue#2', 7)).toBeNull()
        expect(findAnnotationReferenceQuery('参考#2', 4)).toBeNull()
        expect(findAnnotationReferenceQuery('参考：#2', 5)).toEqual({
            start: 3,
            end: 5,
            query: '2'
        })
    })

    it('filters by number, author, page, subtype, and content while excluding the current annotation', () => {
        expect(filterAnnotationReferenceCandidates(annotations, '', 'annotation-1').map(({ id }) => id))
            .toEqual(['annotation-2', 'annotation-3'])
        expect(filterAnnotationReferenceCandidates(annotations, 'Alice', 'annotation-1').map(({ id }) => id))
            .toEqual(['annotation-2'])
        expect(filterAnnotationReferenceCandidates(annotations, '8', 'annotation-1').map(({ id }) => id))
            .toEqual(['annotation-3'])
        expect(filterAnnotationReferenceCandidates(annotations, 'Highlight', 'annotation-1').map(({ id }) => id))
            .toEqual(['annotation-3'])
        expect(filterAnnotationReferenceCandidates(annotations, 'Revenue', 'annotation-1').map(({ id }) => id))
            .toEqual(['annotation-3'])
    })
})

describe('AnnotationReferenceInput', () => {
    it('does not propagate editor clicks to an enclosing annotation card', () => {
        const onCardClick = jest.fn()
        render(
            <div onClick={onCardClick}>
                <Theme>
                    <AnnotationReferenceInput
                        annotations={annotations}
                        excludeAnnotationId="annotation-1"
                        onSubmit={jest.fn()}
                        onCancel={jest.fn()}
                    />
                </Theme>
            </div>
        )

        fireEvent.click(screen.getByRole('combobox'))
        fireEvent.click(screen.getByRole('button', { name: 'common:confirm' }))

        expect(onCardClick).not.toHaveBeenCalled()
    })

    it('uses the InkLayer annotation type for candidate icons', () => {
        const arrow = makeAnnotation('annotation-arrow', 2, {
            type: AnnotationType.ARROW,
            subtype: 'Ink',
            pdfjsType: PdfjsAnnotationType.INK
        })
        const { input } = renderInput({
            annotations: [
                makeAnnotation('annotation-1', 1),
                arrow
            ]
        })

        fireEvent.change(input, { target: { value: '#' } })

        const option = screen.getByRole('option')
        expect(option.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 1024 1024')
    })

    it('uses selected source text when a candidate has no user-authored content', () => {
        const { input } = renderInput({
            annotations: [
                makeAnnotation('annotation-1', 1),
                makeAnnotation('annotation-2', 2, {
                    contentsObj: {
                        text: '',
                        selectedText: 'Quoted source text'
                    }
                })
            ]
        })

        fireEvent.change(input, { target: { value: '#' } })

        expect(screen.getByText('Quoted source text')).toBeTruthy()
    })

    it('opens on # and inserts a structured reference with the keyboard', () => {
        const { input, onSubmit } = renderInput()

        fireEvent.change(input, { target: { value: '#' } })
        expect(screen.queryByRole('listbox')).not.toBeNull()
        expect(screen.getAllByRole('option')).toHaveLength(2)
        expect(screen.getByText('07-28')).not.toBeNull()

        fireEvent.keyDown(input, { key: 'Enter' })
        expect(input.value).toBe('#2 ')

        fireEvent.keyDown(input, { key: 'Enter' })
        expect(onSubmit).toHaveBeenCalledWith({
            content: '#2 ',
            references: [{
                type: 'annotation',
                annotationId: 'annotation-2',
                label: '#2'
            }]
        })
    })

    it('restores focus after an enclosing overlay finishes closing', () => {
        jest.useFakeTimers()
        const previousTrigger = document.createElement('button')
        document.body.appendChild(previousTrigger)

        try {
            const { input } = renderInput()

            act(() => {
                previousTrigger.focus()
            })
            expect(document.activeElement).toBe(previousTrigger)

            act(() => {
                jest.advanceTimersByTime(20)
            })
            expect(document.activeElement).toBe(input)
        } finally {
            previousTrigger.remove()
            jest.useRealTimers()
        }
    })

    it('supports arrow-key selection before insertion', () => {
        const { input } = renderInput()

        fireEvent.change(input, { target: { value: '#' } })
        let options = screen.getAllByRole('option')
        expect(options[0].tagName).toBe('DIV')
        expect(options[0].getAttribute('aria-selected')).toBe('true')

        fireEvent.keyDown(input, { key: 'ArrowDown' })
        options = screen.getAllByRole('option')
        expect(options[0].getAttribute('aria-selected')).toBe('false')
        expect(options[1].getAttribute('aria-selected')).toBe('true')

        fireEvent.keyDown(input, { key: 'Enter' })

        expect(input.value).toBe('#3 ')
    })

    it('inserts at the caret and keeps surrounding text intact', () => {
        const { input } = renderInput({ initialContent: 'See  now.' })

        fireEvent.change(input, {
            target: {
                value: 'See # now.',
                selectionStart: 5,
                selectionEnd: 5
            }
        })
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(input.value).toBe('See #2 now.')
        expect(input.selectionStart).toBe(6)
    })

    it('supports pointer selection and preserves Shift+Enter for a newline', () => {
        const { input, onSubmit } = renderInput()

        fireEvent.change(input, { target: { value: '#Ali' } })
        fireEvent.click(screen.getByRole('option'))
        expect(input.value).toBe('#2 ')

        fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('keeps manually typed #N as plain text when the menu is dismissed', () => {
        const { input, onSubmit } = renderInput()

        fireEvent.change(input, { target: { value: '#2' } })
        fireEvent.keyDown(input, { key: 'Escape' })
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(onSubmit).toHaveBeenCalledWith({
            content: '#2',
            references: undefined
        })
    })

    it('cleans reference metadata when its visible label is deleted', () => {
        const { input, onSubmit } = renderInput({
            initialContent: 'See #2.',
            initialReferences: [{
                type: 'annotation',
                annotationId: 'annotation-2',
                label: '#2'
            }]
        })

        fireEvent.change(input, { target: { value: 'See it.' } })
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(onSubmit).toHaveBeenCalledWith({
            content: 'See it.',
            references: undefined
        })
    })

    it('does not submit while an IME composition is active', () => {
        const { input, onSubmit } = renderInput()

        fireEvent.compositionStart(input)
        fireEvent.change(input, { target: { value: '批注' } })
        fireEvent.keyDown(input, { key: 'Enter', isComposing: true })

        expect(onSubmit).not.toHaveBeenCalled()
    })

    it('cancels the editor with Escape when the reference menu is closed', () => {
        const { input, onCancel } = renderInput()

        fireEvent.keyDown(input, { key: 'Escape' })

        expect(onCancel).toHaveBeenCalledTimes(1)
    })

    it('cancels only after focus leaves the complete editor', async () => {
        const { input, onCancel } = renderInput()
        const confirm = screen.getByRole('button', { name: 'common:confirm' })
        const outside = document.createElement('button')
        document.body.appendChild(outside)

        await waitFor(() => expect(document.activeElement).toBe(input))

        act(() => {
            confirm.focus()
        })
        expect(onCancel).not.toHaveBeenCalled()

        act(() => {
            outside.focus()
        })
        await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(1))
        outside.remove()
    })
})
