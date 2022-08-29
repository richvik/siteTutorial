
export function scrollToElement(context) {
    return new Promise(resolve => {
        if (context.getCurrentObjByStep.elDOM && context.getCurrentObjByStep.scrollToElement) {
            smoothScroll(context.getCurrentObjByStep.elDOM, {
                behavior: 'smooth'
            }).then(() => {
                resolve();
            });
        } else {
            resolve();
        }
    });
}

export function smoothScroll(elem, options) {
    return new Promise(resolve => {
        if (!(elem instanceof Element)) {
            throw new TypeError('Argument 1 must be an Element');
        }
        let same = 0; // a counter
        let lastPos = null; // last known Y position
        // pass the user defined options along with our default
        const scrollOptions = Object.assign({ behavior: 'smooth' }, options);

        // let's begin
        elem.scrollIntoView(scrollOptions);
        requestAnimationFrame(check);

        // this function will be called every painting frame
        // for the duration of the smooth scroll operation
        function check() {
            // check our current position
            const newPos = elem.getBoundingClientRect().top;

            if (newPos === lastPos) { // same as previous
                if (same++ > 2) { // if it's more than two frames
                    /* @todo: verify it succeeded
                     * if(isAtCorrectPosition(elem, options) {
                     *   resolve();
                     * } else {
                     *   reject();
                     * }
                     * return;
                     */
                    return resolve(); // we've come to an halt
                }
            } else {
                same = 0; // reset our counter
                lastPos = newPos; // remember our current position
            }

            // check again next painting frame
            requestAnimationFrame(check);
        }
    });
}

export function toggleOpacity(el, visibility = '1') {
    if (el) {
        el.style.opacity = visibility;
    }
}

export function toggleVisibility(el, hidden = false) {
    if (el) {
        el.style.display = hidden ? 'none' : 'inline-block';
    }
}

export function removeProperties(element, ...attrs) {
    attrs.forEach(attr => element?.style.removeProperty(attr));
}

export function elementReady(parent, selector) {
    return new Promise(resolve => {
        const el = parent.querySelector(selector);

        if (el) {
            resolve(el);
        }
        new MutationObserver((mutationRecords, observer) => {
            // Query for elements matching the specified selector
            Array.from(parent.querySelectorAll(selector)).forEach(element => {
                resolve(element);

                // Once we have resolved we don`t need the observer anymore.
                observer.disconnect();
            });
        }).observe(parent.documentElement, {
            childList: true,
            subtree: true
        });
    });
}

export function setAttributeToElement(element, attribute, attributeValue) {
    if (element && attribute) {
        element.setAttribute(attribute, attributeValue);
    }
}

export function makeNegativeNumberZero(num) {
    return Math.max(0, num);
}

export function getTimeTransition(elem) {
    const stringDuration = getComputedStyle(elem).transitionDuration;

    try {
        const arrayDuration = stringDuration.split(',');
        const convertArray = arrayDuration.map(item => parseFloat(item.trim()));
        const maxValue = Math.max.apply(null, convertArray);

        return maxValue * 1000;
    } catch (e) {
        return 0;
    }

}

export function getDataFromStore(currentState) {
    if (!currentState) {
        return null;
    }

    return APP.store.getState()[currentState.name]?.[currentState.value];
}
