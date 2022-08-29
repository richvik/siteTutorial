import { createPopper } from '@popperjs/core';
import { LIST_DIRECTIONS } from 'wildix/modules/Tutorial/constants';
import { makeNegativeNumberZero } from 'wildix/modules/Tutorial/functions';

export default class TooltipOverlayPosition {
    constructor(context) {
        this.ctx = context;
    }

    calculateSizeForSelectedElement() {
        if (Array.isArray(this.ctx.getCurrentObjByStep.selector)) {
            const groupList = document.createElement('div');
            const calculateSize = {
                width: 0,
                height: 0,
                x: 0,
                y: 0,
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            };

            this.ctx.getCurrentObjByStep?.selector.forEach(item => {
                const currentElement = document.querySelector(item);

                if (!currentElement || !currentElement?.offsetParent) {
                    return;
                }
                const elRect = currentElement.getBoundingClientRect();

                if (calculateSize.bottom === 0) {
                    calculateSize.bottom = elRect.bottom;
                }
                if (calculateSize.top === 0) {
                    calculateSize.top = elRect.top;
                }
                if (calculateSize.left === 0) {
                    calculateSize.left = elRect.left;
                }
                if (calculateSize.right === 0) {
                    calculateSize.right = elRect.right;
                }

                calculateSize.top = Math.min(elRect.top, calculateSize.top);
                calculateSize.left = Math.min(elRect.left, calculateSize.left);
                calculateSize.right = Math.max(elRect.right, calculateSize.right);
                calculateSize.bottom = Math.max(elRect.bottom, calculateSize.bottom);


                calculateSize.width = calculateSize.right - calculateSize.left;
                calculateSize.height = calculateSize.bottom - calculateSize.top;

                calculateSize.y = elRect.y;
                calculateSize.x = elRect.x;
            });

            Object.assign(this.ctx.getCurrentObjByStep, {
                el: groupList,
                isGroup: true,
                position: calculateSize
            });
        } else {
            const selectedElement = document.querySelector(this.ctx.getCurrentObjByStep.selector);

            if (!selectedElement) {
                return;
            }
            const elementPosition = selectedElement.getBoundingClientRect();

            Object.assign(this.ctx.getCurrentObjByStep, {
                el: selectedElement,
                position: {
                    width: makeNegativeNumberZero(elementPosition.width),
                    height: makeNegativeNumberZero(elementPosition.height),
                    x: makeNegativeNumberZero(elementPosition.x),
                    y: makeNegativeNumberZero(elementPosition.y),
                    left: makeNegativeNumberZero(elementPosition.left),
                    right: makeNegativeNumberZero(elementPosition.right),
                    top: makeNegativeNumberZero(elementPosition.top),
                    bottom: makeNegativeNumberZero(elementPosition.bottom)
                }
            });
        }
    }


    setPositionTooltip() {
        const { el, arrowEl } = this.ctx.popupContent;
        const { tooltipPosition, elDOM } = this.ctx.getCurrentObjByStep;

        const popperInstance = createPopper(elDOM, el, {
            placement: tooltipPosition.placement,
            modifiers: [
                {
                    name: 'preventOverflow',
                    options: {
                        altAxis: true // false by default
                    }
                },
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: [ 'top', 'right', 'left', 'bottom' ]
                    }
                },
                {
                    name: 'arrow',
                    options: {
                        element: arrowEl,
                        padding: 10
                    }
                },
                {
                    name: 'offset',
                    options: {
                        offset: [ 0, 20 ]
                    }
                }
            ]
        });

        popperInstance.forceUpdate();

    }

    setPositionForOverlay() {
        const { innerHeight, innerWidth } = window;

        const {
            top,
            left,
            bottom,
            right,
            height,
            width
        } = this.ctx.getCurrentObjByStep.position || {};
        const { bottomDirection, topDirection, leftDirection, rightDirection, centerDirection } = LIST_DIRECTIONS;

        this.ctx.listOverlays.arrayPositions.forEach(item => {
            const overlay = this.ctx.listOverlays[item];

            if (item === topDirection) {
                overlay.style.top = 0;
                overlay.style.bottom = top;
                overlay.style.left = 0;
                overlay.style.height = top;
                overlay.style.width = innerWidth;
            } else if (item === leftDirection) {
                overlay.style.top = top;
                overlay.style.bottom = innerHeight;
                overlay.style.left = 0;
                overlay.style.height = height;
                overlay.style.width = left;
            } else if (item === rightDirection) {
                overlay.style.top = top;
                overlay.style.bottom = innerHeight;
                overlay.style.right = 0;
                overlay.style.height = height;
                overlay.style.width = innerWidth - right;
            } else if (item === bottomDirection) {
                overlay.style.top = bottom;
                overlay.style.bottom = 0;
                overlay.style.left = 0;
                overlay.style.height = innerHeight - bottom;
                overlay.style.width = innerWidth;
            } else if (item === centerDirection) {
                overlay.style.top = top;
                overlay.style.bottom = bottom;
                overlay.style.left = left;
                overlay.style.height = height;
                overlay.style.width = width;
            }
        });
    }

}
