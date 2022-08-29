import i18next from 'i18next';
import {
    LIST_DIRECTIONS,
    NAVIGATION_CLOSE, NAVIGATION_NEXT,
    NAVIGATION_PREV
} from 'wildix/modules/Tutorial/constants';
import {
    setAttributeToElement,
    toggleOpacity
} from 'wildix/modules/Tutorial/functions';

export default class ElementsCreator {
    dotElement = [
        {
            elementToAppend: 'documentBody',
            elementToAppendClass: '.moreactions',
            pathToObject: 'dotElement',
            className: 'tutorial-dot',
            btnName: 'el'
        }
    ];
    rootContent = [
        {
            elementToAppend: 'documentBody',
            pathToObject: 'rootContent',
            className: 'wildix-tutorial',
            btnName: 'rootEl'
        }
    ]
    popupContent = [
        {
            elementToAppend: 'getRootElement',
            pathToObject: 'popupContent',
            className: 'popup-content',
            idName: 'tooltip',
            btnName: 'el',
            listButtons: [
                {
                    pathToObject: 'popupContent',
                    className: 'arrow',
                    idName: 'arrow',
                    attribute: 'data-popper-arrow',
                    btnName: 'arrowEl'
                },
                {
                    pathToObject: 'popupContent',
                    className: 'close-icon',
                    btnName: 'closeEl',
                    attribute: 'action-name',
                    attributeValue: NAVIGATION_CLOSE
                },
                {
                    pathToObject: 'popupContent',
                    className: 'popup-content__title',
                    btnName: 'titleEl'
                },
                {
                    pathToObject: 'popupContent',
                    className: 'loading',
                    btnName: 'loader',
                    visible: 'none'
                }
            ]
        },
        {
            elementToAppend: 'getPopupElement',
            pathToObject: 'popupContent',
            className: 'btn__wrapper',
            btnName: 'wrapperButtons',
            listButtons: [
                {
                    pathToObject: 'popupContent',
                    className: 'btn btn-prev',
                    btnName: 'btnPrev',
                    attribute: 'action-name',
                    attributeValue: NAVIGATION_PREV
                },
                {
                    pathToObject: 'popupContent',
                    className: 'btn btn-next',
                    btnName: 'btnNext',
                    attribute: 'action-name',
                    attributeValue: NAVIGATION_NEXT,
                    titleKey: 'tutorial.btnNext'
                },
                {
                    pathToObject: 'popupContent',
                    className: 'btn btn-complete',
                    btnName: 'btnComplete',
                    attribute: 'action-name',
                    attributeValue: NAVIGATION_CLOSE,
                    titleKey: 'tutorial.btnNextComplete'
                }
            ]
        }
    ]
    listOverlays = [
        {
            elementToAppend: 'getRootElement',
            pathToObject: 'listOverlays',
            className: 'overlay overlay-top',
            btnName: LIST_DIRECTIONS.topDirection,
            attribute: 'action-name',
            attributeValue: NAVIGATION_CLOSE
        },
        {
            elementToAppend: 'getRootElement',
            pathToObject: 'listOverlays',
            className: 'overlay overlay-left',
            btnName: LIST_DIRECTIONS.leftDirection,
            attribute: 'action-name',
            attributeValue: NAVIGATION_CLOSE
        },
        {
            elementToAppend: 'getRootElement',
            pathToObject: 'listOverlays',
            className: 'overlay overlay-right',
            btnName: LIST_DIRECTIONS.rightDirection,
            attribute: 'action-name',
            attributeValue: NAVIGATION_CLOSE
        },
        {
            elementToAppend: 'getRootElement',
            pathToObject: 'listOverlays',
            className: 'overlay overlay-bottom',
            btnName: LIST_DIRECTIONS.bottomDirection,
            attribute: 'action-name',
            attributeValue: NAVIGATION_CLOSE
        },
        {
            elementToAppend: 'getRootElement',
            pathToObject: 'listOverlays',
            className: 'overlay overlay-center',
            btnName: LIST_DIRECTIONS.centerDirection,
            attribute: 'action-name',
            attributeValue: NAVIGATION_CLOSE
        }
    ]


    constructor(context) {
        this.ctx = context;
    }

    getElementBySelector(className) {
        return this.ctx.documentBody.querySelector(className);
    }

    createButtonAndAppend(listArray = [], rootAppendElement) {
        listArray.forEach(item => {
            this.ctx[item.pathToObject][item.btnName] = document.createElement('div');
            this.ctx[item.pathToObject][item.btnName].className = item.className;
            if (item.idName) {
                this.ctx[item.pathToObject][item.btnName].id = item.idName;
            }

            this.ctx[item.pathToObject][item.btnName].innerText = i18next.t(item.titleKey);
            setAttributeToElement(this.ctx[item.pathToObject][item.btnName], item.attribute, item.attributeValue);
            item.visible && toggleOpacity(this.ctx[item.pathToObject][item.btnName], 0);

            rootAppendElement.appendChild(this.ctx[item.pathToObject][item.btnName]);
        });
    }

    createElementAndAppend(arrayCreators) {
        const currentArrayList = this[arrayCreators] ?? [];

        currentArrayList.forEach(item => {
            const wrapElement = this.createElementToAppend(item);

            if (item.listButtons) {
                this.createButtonAndAppend(item.listButtons, wrapElement);
            }
            if (item.elementToAppendClass) {
                this.getElementBySelector(item.elementToAppendClass)?.appendChild(wrapElement);

                return;
            }
            this.ctx[item.elementToAppend]?.appendChild(wrapElement);
        });
    }

    createElementToAppend(params) {
        this.ctx[params.pathToObject][params.btnName] = document.createElement('div');
        this.ctx[params.pathToObject][params.btnName].className = params.className;
        if (params.idName) {
            this.ctx[params.pathToObject][params.btnName].id = params.idName;
        }
        setAttributeToElement(this.ctx[params.pathToObject][params.btnName], params.attribute, params.attributeValue);

        return this.ctx[params.pathToObject][params.btnName];
    }

}
