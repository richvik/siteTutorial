import { updateConfig } from 'components/base/config';
import {
    getLocalParticipant
} from 'components/base/participants';
import {
    setToolboxEnabled
} from 'components/toolbox/actions';
import { setToolboxVisible } from 'components/toolbox/actions.any';
import i18next from 'i18next';
import keyboardshortcut from 'modules/keyboardshortcut/keyboardshortcut';
import { hideCustomNotification } from 'wildix/components/notifications';
import { updateStoreTutorial } from 'wildix/components/tutorial/actions';
import ElementsCreator from 'wildix/modules/Tutorial/ElementsCreator';
import TooltipOverlayPosition
from 'wildix/modules/Tutorial/TooltipOverlayPosition';
import {
    elementReady, getDataFromStore, getTimeTransition,
    removeProperties,
    scrollToElement,
    toggleOpacity, toggleVisibility
} from 'wildix/modules/Tutorial/functions';
import WildixEvents from 'wildix/service/WildixEvents';

import {
    EXTERNAL_USER,
    FIREHOSE_EVENTS,
    NAVIGATION_CLOSE,
    NAVIGATION_FEATURE_TUTORIAL,
    NAVIGATION_FULL_TUTORIAL,
    NAVIGATION_INITIAL_STEP,
    NAVIGATION_NEXT,
    NAVIGATION_PREV,
    VERSION_FEATURE,
    WIZYCONF_HW_NAME,
    WIZYCONF_NAME,
    XBEES_NAME
} from './constants';
import {
    listAllNavigations,
    tutorialNavigationConfig
} from './tutorialNavigationConfig';


export default class SiteTutorial {
    documentBody = document.body;
    resizeWindowInstance = null;
    keyboardNavigationInstance = null;
    clickNavigationInstance = null;
    skipKeyEventRepeatDuringMs = 500;
    currentStoreState = null;
    lastKeyDownAt = 0;
    prevStoreState = {};
    keyCodes = {
        27: {
            key: NAVIGATION_CLOSE,
            action: () => {
                this.disableTutorial();
            }
        },
        37: {
            key: NAVIGATION_PREV,
            action: () => {
                this.changeCurrentStep(NAVIGATION_PREV);
            }
        },
        39: {
            key: NAVIGATION_NEXT,
            action: () => {
                this.changeCurrentStep(NAVIGATION_NEXT);
            }
        }
    }
    listOverlays = {
        top: null,
        left: null,
        right: null,
        bottom: null,
        center: null,
        arrayPositions: [ 'top', 'left', 'right', 'bottom', 'center' ]
    }
    currentNavigation = {
        prevStep: null,
        currentStep: NAVIGATION_INITIAL_STEP,
        currentTutorial: NAVIGATION_FULL_TUTORIAL,
        currentStage: WIZYCONF_NAME
    }

    rootContent = {
        rootEl: null
    };
    popupContent = {
        el: null,
        titleEl: null,
        wrapperButtons: null,
        btnPrev: null,
        btnNext: null,
        btnComplete: null,
        loader: null,
        arrowEl: null,
        arrowSelected: '',
        stateClassTransition: null,
        positions: {
            posTop: 0,
            posLeft: 0
        },
        baseParams: {
            sizeArrow: 30,
            baseMargin: 20,
            timerTransition: 200
        }
    };
    dotElement = {
        el: null
    };
    elementsCreator = null;
    tooltipOverlayPosition = null;

    constructor() {
        this.#conferenceLoaded();
        APP.wildix.eventEmitter.on(WildixEvents.SHOW_TUTORIAL, this.runTutorialByStep.bind(this));
        APP.wildix.eventEmitter.on(WildixEvents.DIALOG_TUTORIAL_OPENED, this.dialogOpened.bind(this));

        APP.wildix.eventEmitter.on(WildixEvents.CONFERENCE_DISPOSE, () => {
            this.disableTutorial();
        });
        APP.wildix.eventEmitter.on(WildixEvents.CONNECTION_ERROR, () => {
            this.disableTutorial();
        });
    }
    get getRootElement() {
        return this.rootContent.rootEl;
    }
    get getPopupElement() {
        return this.popupContent.el;
    }
    get getCurrentStep() {
        return this.currentNavigation.currentStep;
    }
    get getCurrentStage() {
        return this.currentNavigation.currentStage;
    }
    get getCurrentTutorial() {
        return this.currentNavigation.currentTutorial;
    }
    get getCurrentObjectKey() {
        const { currentTutorial, currentStage, currentStep } = this.currentNavigation;

        return tutorialNavigationConfig[currentStage][currentTutorial][currentStep];
    }
    get getCurrentListStage() {
        const { currentStage } = this.currentNavigation;

        return tutorialNavigationConfig[currentStage];
    }
    get getCurrentObjByStep() {
        return listAllNavigations[this.getCurrentObjectKey] || {};
    }
    get lastIndexTutorial() {
        const { currentTutorial, currentStage } = this.currentNavigation;

        return tutorialNavigationConfig[currentStage][currentTutorial].length - 1;
    }
    get isNextElementLast() {
        return this.getCurrentStep === this.lastIndexTutorial || this.getCurrentStep + 1 > this.lastIndexTutorial;
    }
    get isPrevElementLast() {
        return this.getCurrentStep === 0;
    }
    get checkNewFeatureAvailable() {
        const { versionFeature } = APP.store.getState()['wildix/features/tutorial'];

        return versionFeature !== VERSION_FEATURE;
    }
    get isModeratorRoleDifferent() {
        const localParticipant = getLocalParticipant(APP.store.getState());
        const { participantRole } = APP.store.getState()['wildix/features/tutorial'];

        return participantRole !== localParticipant.role;
    }

    setCurrentNavigation(name, value) {
        this.currentNavigation[name] = value;
    }

    #conferenceLoaded() {
        this.elementsCreator = new ElementsCreator(this);
        this.tooltipOverlayPosition = new TooltipOverlayPosition(this);
        if (this.checkNewFeatureAvailable) {
            this.elementsCreator.createElementAndAppend('dotElement');
        }
    }

    dialogOpened() {
        this.setCurrentStageTutorial();

        if (this.isModeratorRoleDifferent || this.checkNewFeatureAvailable) {
            this.setCustomNavigation();
            const localParticipant = getLocalParticipant(APP.store.getState());

            APP.store.dispatch(updateStoreTutorial({
                listNewFeatures: this.listNewFeatures(),
                participantRole: localParticipant.role
            }));
        }

        if (this.checkNewFeatureAvailable) {
            APP.store.dispatch(updateStoreTutorial({
                versionFeature: VERSION_FEATURE
            }));
            toggleVisibility(this.dotElement.el, true);
        }
    }

    isAllFeatureWereShown() {
        const { listNewFeatures = [] } = APP.store.getState()['wildix/features/tutorial'];

        return listNewFeatures.find(item => !item.wasShowed) === undefined;
    }

    isCurrentTutorialWereShown() {
        const { [this.getCurrentTutorial]: currentTutorial } = APP.store.getState()['wildix/features/tutorial'];

        if (currentTutorial.isAllStepsWereShow) {
            return currentTutorial.isAllStepsWereShow;
        }

        if (this.getCurrentTutorial === NAVIGATION_FULL_TUTORIAL) {
            return this.isNextElementLast;
        }

        return this.isAllFeatureWereShown();
    }

    async initTutorial() {
        await this.toggleToolboxVisible();

        // Will be used if users want to see all content for x-bees
        // this.closeChatForXbees();

        if (!this.getRootElement) {
            this.elementsCreator.createElementAndAppend('rootContent');
            this.elementsCreator.createElementAndAppend('popupContent');
            this.elementsCreator.createElementAndAppend('listOverlays');
        }

        this.bindEventsReInit();
        this.toggleTransitionClass(true);
        await this.updateContent();
        this.changeTextInNextButton();
        this.setTutorialVisible();
    }

    closeChatForXbees() {
        const { currentStage } = this.currentNavigation;

        if (currentStage === XBEES_NAME) {
            APP.xBeesEvents.toggleChat(true);
            APP.xBeesEvents.toggleInfo(true);
        }

    }

    bindEventsReInit() {
        this.resizeWindowInstance = this.resizeWindow.bind(this);
        this.keyboardNavigationInstance = this.keyboardNavigation.bind(this);
        this.clickNavigationInstance = this.addClickListener.bind(this);
        window.addEventListener('click', this.clickNavigationInstance, true);
        window.addEventListener('resize', this.resizeWindowInstance, false);
        window.addEventListener('keyup', this.keyboardNavigationInstance, true);
    }

    keyboardNavigation(e) {
        const keycode = e.which;
        const action = this.keyCodes[keycode];

        if (typeof action !== 'object') {
            return;
        }

        this.keyCodes[keycode].action(e);
    }

    createArrayObjectFromConfig(array) {
        return array.map((item, index) => {
            return {
                title: listAllNavigations[item].title,
                id: item,
                wasShowed: false,
                callObj: {
                    type: NAVIGATION_FEATURE_TUTORIAL,
                    step: index
                }
            };
        });
    }

    listNewFeatures() {
        const { listNewFeatures } = APP.store.getState()['wildix/features/tutorial'];
        const arrayFeaturesFromConfig = tutorialNavigationConfig[this.getCurrentStage][NAVIGATION_FEATURE_TUTORIAL];
        const arrayFromConfig = this.createArrayObjectFromConfig(arrayFeaturesFromConfig);

        if (!listNewFeatures) {
            return arrayFromConfig;
        }

        arrayFromConfig.forEach(item => {
            listNewFeatures.forEach(itemInner => {
                if (itemInner.id === item.id && itemInner.wasShowed === true) {
                    item.wasShowed = true;
                }
            });
        });

        return arrayFromConfig;
    }

    async getTimeByElement(selector) {
        const { transitionDelay } = this.getCurrentObjByStep;
        const elem = document.querySelector(selector);

        if (elem && !this.currentStoreState) {
            return getTimeTransition(elem);
        } else if (transitionDelay) {
            return transitionDelay;
        }

        return 0;
    }

    async toggleToolboxVisible(state = true) {
        return new Promise(resolve => {
            (async () => {
                const timer = await this.getTimeByElement('#new-toolbox');

                setTimeout(resolve, timer);
            })();

            const dispatch = APP.store.dispatch;

            dispatch(updateConfig({
                toolbarConfig: {
                    alwaysVisible: state
                }
            }));
            dispatch(setToolboxVisible(state));
            dispatch(setToolboxEnabled(true));

            dispatch(hideCustomNotification());

            keyboardshortcut.enable(false);
        });
    }

    updateStoreShowedByIndex() {
        if (this.getCurrentTutorial === NAVIGATION_FEATURE_TUTORIAL) {
            const { listNewFeatures } = APP.store.getState()['wildix/features/tutorial'];

            listNewFeatures[this.currentNavigation.currentStep].wasShowed = true;
        }
    }

    setCustomNavigation() {
        const arrayNavigationsByStage = this.getCurrentListStage;
        const { currentStage } = this.currentNavigation;
        const localParticipant = getLocalParticipant(APP.store.getState());

        Object.keys(arrayNavigationsByStage).forEach(itemKey => {
            const arrayByStep = tutorialNavigationConfig[currentStage][itemKey];

            // eslint-disable-next-line max-len
            tutorialNavigationConfig[currentStage][itemKey] = arrayByStep.filter(name => this.isUserRoleAllow(name, localParticipant));
        });

    }

    isUserRoleAllow(nameNav, localParticipant) {
        const typeRole = listAllNavigations[nameNav]?.typeRole;

        if (!typeRole) {
            return true;
        }

        return localParticipant.role === typeRole;

    }

    runTutorialByStep(params = {}) {
        const { type, step } = params;

        this.setCurrentNavigation('currentTutorial', type);
        this.setCurrentNavigation('currentStep', step);

        this.initTutorial();
    }

    addClickListener(event) {

        const currentEl = event?.target;
        const attributeActionName = currentEl.getAttribute('action-name');

        if (!attributeActionName) {
            event.preventDefault();
            event.stopPropagation();

            return;
        }


        if (attributeActionName === NAVIGATION_CLOSE) {
            this.disableTutorial();

            return;
        }
        event.preventDefault();
        event.stopPropagation();
        this.changeCurrentStep(attributeActionName);
    }

    changeCurrentStep(action) {
        if (Date.now() - this.lastKeyDownAt < this.skipKeyEventRepeatDuringMs || this.isEndNavigation(action)) {
            console.log('keydown skipped');

            return false;
        }
        this.callAction('closeAction');
        this.toggleCustomStyles('remove');
        this.toggleTransitionClass(true);

        this.lastKeyDownAt = Date.now();
        if (action === NAVIGATION_NEXT) {
            this.setCurrentNavigation('currentStep', this.currentNavigation.currentStep + 1);
        } else if (action === NAVIGATION_PREV) {
            this.setCurrentNavigation('currentStep', this.currentNavigation.currentStep - 1);
        }
        this.updateContent();
    }

    isEndNavigation(action) {
        if (action === NAVIGATION_NEXT) {
            return this.isNextElementLast;
        } else if (action === NAVIGATION_PREV) {
            return this.isPrevElementLast;
        }
    }

    toggleCustomStyles(objStyles = 'add') {
        const customClassObject = this.getCurrentObjByStep.toggleCustomClass;

        if (!customClassObject || !this.getCurrentObjByStep.elDOM) {
            return;
        }
        customClassObject.forEach(objectStyles => {
            if (Array.isArray(objectStyles.className)) {
                objectStyles.className.forEach(selector => {
                    const elem = document.querySelector(selector);

                    if (!elem) {
                        return;
                    }
                    if (objStyles === 'add') {
                        elem.style.cssText = objectStyles.cssStyleAdd;
                        objectStyles.addClassName && elem.classList.add(objectStyles.addClassName);
                    } else {
                        objectStyles.cssStyleRemove && removeProperties(elem, ...objectStyles.cssStyleRemove);
                        objectStyles.removeClassName && elem.classList.remove(objectStyles.removeClassName);
                    }

                });
            } else {
                const elem = document.querySelector(objectStyles.className);

                if (!elem) {
                    return;
                }
                if (objStyles === 'add') {
                    elem.style.cssText = objectStyles.cssStyleAdd;
                    objectStyles.addClassName && elem.classList.add(objectStyles.addClassName);
                } else {
                    objectStyles.cssStyleRemove && removeProperties(elem, ...objectStyles.cssStyleRemove);
                    objectStyles.removeClassName && elem.classList.remove(objectStyles.removeClassName);
                }
            }
        });
    }


    checkVisibilityButtons() {
        const { btnPrev, btnNext, btnComplete } = this.popupContent;

        toggleVisibility(btnPrev, this.isPrevElementLast);
        toggleVisibility(btnNext, this.isNextElementLast);
        toggleVisibility(btnComplete, !this.isNextElementLast);
    }

    changeTextInNextButton() {
        const { btnNext } = this.popupContent;

        if (this.getCurrentTutorial === NAVIGATION_FEATURE_TUTORIAL) {
            btnNext.innerText = i18next.t('tutorial.btnNextFeature');
        } else {
            btnNext.innerText = i18next.t('tutorial.btnNext');
        }
    }

    toggleTransitionClass(visibleState) {
        const { el, arrowEl, stateClassTransition } = this.popupContent;

        if (stateClassTransition === visibleState) {
            return;
        }

        if (visibleState) {
            el.classList.add('move_transition');
            arrowEl.classList.add('move_transition');
        } else {
            el.classList.remove('move_transition');
            arrowEl.classList.remove('move_transition');
        }
        this.popupContent.stateClassTransition = visibleState;
    }

    resizeWindow() {
        this.toggleTransitionClass(false);

        scrollToElement(this).then(() => {
            this.tooltipOverlayPosition.calculateSizeForSelectedElement();
            this.tooltipOverlayPosition.setPositionForOverlay();
        });
    }

    async updateContent() {
        const { getSateFromStore } = this.getCurrentObjByStep;

        this.currentStoreState = getDataFromStore(getSateFromStore);

        this.checkVisibilityButtons();
        this.updateStoreShowedByIndex();

        await this.callAction();
        await this.handlerElementTransition();

        APP.store.dispatch(updateStoreTutorial({
            [this.getCurrentTutorial]: {
                currentStep: this.getCurrentStep,
                currentTutorial: this.getCurrentTutorial,
                maxCountSteps: this.lastIndexTutorial,
                isAllStepsWereShow: this.isCurrentTutorialWereShown(),
                dateNow: Date.now()
            }
        }));
    }

    updateNavigationIFNoElement() {
        const arrayFromConfig = tutorialNavigationConfig[this.getCurrentStage][this.getCurrentTutorial];

        const newArray = arrayFromConfig.filter(elem => elem !== this.getCurrentObjectKey);

        tutorialNavigationConfig[this.getCurrentStage][this.getCurrentTutorial] = newArray;
    }

    toggleCenterOverlay(command, time) {
        const { center } = this.listOverlays;

        if (command === 'start') {
            toggleOpacity(center, '1');
        } else if (command === 'end') {
            toggleOpacity(center, '0');
        }
    }

    async goToNextNavigationIfNoElement() {
        const { currentStep, prevStep } = this.currentNavigation;

        this.updateNavigationIFNoElement();

        if (this.getCurrentTutorial === NAVIGATION_FEATURE_TUTORIAL) {
            APP.store.dispatch(updateStoreTutorial({
                listNewFeatures: this.listNewFeatures()
            }));
            this.changeCurrentStep();

            return;
        }

        if (currentStep < prevStep || this.isNextElementLast) {
            this.changeCurrentStep(NAVIGATION_PREV);
        } else {
            this.changeCurrentStep();
        }
    }

    async handlerElementTransition() {
        const { selector, selectorTooltip, transitionSelector, elDOM } = this.getCurrentObjByStep;
        const selectorForTooltip = selectorTooltip || (Array.isArray(selector) ? selector[0] : selector);
        const timer = await this.getTimeByElement(transitionSelector);
        const timerIfNoElement = timer === 0 ? 1000 : timer * 3;

        this.timerElementDOM = setTimeout(() => {
            this.goToNextNavigationIfNoElement();
        }, timerIfNoElement);

        this.getCurrentObjByStep.elDOM = await elementReady(document, selectorForTooltip);

        this.toggleVisibilityContentLoading('0.3', timer);
        this.toggleCenterOverlay('start', timer);
        setTimeout(() => {
            scrollToElement(this).then(() => {
                if (!document.body.contains(elDOM)) {
                    this.getCurrentObjByStep.elDOM = document.querySelector(selectorForTooltip);
                }

                this.toggleVisibilityContentLoading('1', timer);
                this.toggleCustomStyles();
                this.tooltipOverlayPosition.calculateSizeForSelectedElement();
                this.updatePopupContent();
                this.tooltipOverlayPosition.setPositionForOverlay();

                this.tooltipOverlayPosition.setPositionTooltip();

                toggleOpacity(this.popupContent.el, '1');

                clearTimeout(this.timerElementDOM);
                this.currentNavigation.prevStep = this.currentNavigation.currentStep;
                this.toggleCenterOverlay('end', timer);
            });
        }, timer);
    }

    async callAction(typeAction = 'runAction') {
        const { getSateFromStore } = this.getCurrentObjByStep;
        const { objectName, storeNameValue } = this.prevStoreState;
        const prevObjetByStep = listAllNavigations[objectName];
        const storeValuePrev = getDataFromStore(prevObjetByStep?.getSateFromStore);
        const storeValueCurrent = getDataFromStore(getSateFromStore);

        if (storeValueCurrent) {
            return;
        } else if (typeAction === 'runAction' && storeValuePrev && getSateFromStore?.value !== storeNameValue) {
            await this.callActionByStep('closeAction', prevObjetByStep);
        }
        await this.callActionByStep(typeAction);
    }

    callActionByStep = (typeAction, objectToCall = this.getCurrentObjByStep) => new Promise(resolve => {
        if (!objectToCall?.[typeAction]) {
            resolve();

            return;
        }
        objectToCall[typeAction].forEach(item => {
            setTimeout(async () => {
                APP.store.dispatch(item.actionDispatch(item.params, item.paramsObject));

                await this.updatePrevObjectFromState();
                resolve();
            }, item.delay ?? 0);
        });
    })

    async updatePrevObjectFromState() {
        const { getSateFromStore } = this.getCurrentObjByStep;

        if (!getSateFromStore) {
            return;
        }
        const storeValue = getDataFromStore(getSateFromStore);

        this.prevStoreState = {
            objectName: this.getCurrentObjectKey,
            storeName: getSateFromStore?.name,
            storeNameValue: getSateFromStore?.value,
            stateValue: storeValue
        };
    }

    toggleVisibilityContentLoading(opacityValue, timer) {
        if (timer <= 0) {
            return;
        }
        const { titleEl, wrapperButtons, loader } = this.popupContent;

        toggleOpacity(titleEl, opacityValue);
        toggleOpacity(wrapperButtons, opacityValue);
        toggleOpacity(loader, opacityValue === '1' ? '0' : '1');
    }

    updatePopupContent() {
        const { combineLangKey } = this.getCurrentObjByStep;

        if (!combineLangKey) {
            this.popupContent.titleEl.innerText = i18next.t(`tutorial.${this.getCurrentObjectKey}`);
        } else if (Array.isArray(combineLangKey)) {
            this.popupContent.titleEl.innerText = '';
            combineLangKey.forEach(({ key, visibility }) => {
                if (!visibility) {
                    return;
                }
                this.popupContent.titleEl.innerText += i18next.t(`tutorial.${key}`);
            });
        }

    }

    disableTutorial() {
        if (!this.getRootElement) {
            return;
        }
        window.removeEventListener('resize', this.resizeWindowInstance, false);
        window.removeEventListener('keyup', this.keyboardNavigationInstance, true);
        window.removeEventListener('click', this.clickNavigationInstance, true);
        this.resizeWindowInstance = null;
        this.keyboardNavigationInstance = null;
        this.clickNavigationInstance = null;
        this.toggleCustomStyles('remove');
        this.callAction('closeAction');
        this.setCurrentNavigation('currentStep', NAVIGATION_INITIAL_STEP);
        this.getRootElement.style.display = 'none';
        this.toggleToolboxVisible(false);
        toggleOpacity(this.popupContent.el, '0');
    }

    setTutorialVisible() {
        this.getRootElement.style.display = 'block';
    }

    setCurrentStageTutorial() {
        const { pbxUser } = APP.store.getState()['features/base/config'];
        let currentStage = '';

        if (APP.isExternalProvider) {
            currentStage = XBEES_NAME;
        } else if (APP.wildix.wizy) {
            currentStage = WIZYCONF_HW_NAME;
        } else if (pbxUser) {
            currentStage = WIZYCONF_NAME;
        } else {
            currentStage = EXTERNAL_USER;
        }

        this.setCurrentNavigation('currentStage', currentStage);
    }
}
