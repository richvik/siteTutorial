import { hideDialog, openDialog } from 'components/base/dialog';
import { PARTICIPANT_ROLE } from 'components/base/participants';
import { setFilmstripVisible } from 'components/filmstrip';
import { setGifMenuVisibility } from 'components/gifs/actions';
import {
    toggleReactionsMenuVisibility
} from 'components/reactions/actions';
import {
    openSettingsDialog,
    SETTINGS_TABS
} from 'components/settings';
import { SpeakerStats } from 'components/speaker-stats';
import {
    setOverflowMenuVisible
} from 'components/toolbox/actions';
import { setTileView } from 'components/video-layout';
import Env from 'wildix/modules/Environment';

import {
    NAVIGATION_FEATURE_TUTORIAL,
    NAVIGATION_FULL_TUTORIAL, WIZYCONF_HW_NAME,
    WIZYCONF_NAME, XBEES_NAME, EXTERNAL_USER
} from './constants';


const sharedFullNavigationForAll = [
    'audio', 'video', 'shareScreen', 'chat',
    'raiseHand', 'reactions'
];
const sharedFeatureNavigationForAll = [
    'sidebarSize', 'pinParticipant'
];

export const tutorialNavigationConfig = {
    [WIZYCONF_NAME]: {
        [NAVIGATION_FULL_TUTORIAL]: [
            ...sharedFullNavigationForAll,
            'invitePeople', 'headerPerformance',
            'connectionStatus',
            'moreActions',
            'moreRecording', 'moreMuteEveryone',
            'popupModerator', 'moveVirtualBackground'
        ],
        [NAVIGATION_FEATURE_TUTORIAL]: [
            'popupHints',
            ...sharedFeatureNavigationForAll
        ]
    },
    [XBEES_NAME]: {
        [NAVIGATION_FULL_TUTORIAL]: [
            ...sharedFullNavigationForAll,
            'headerPerformance', 'connectionStatus',
            'moreActions',
            'moreRecording', 'moreMuteEveryone', 'moveVirtualBackground',
            'moreShortcutsBtn', 'toggleFullScreen', 'conversationInfo'
        ],
        [NAVIGATION_FEATURE_TUTORIAL]: [
            'popupHints',
            ...sharedFeatureNavigationForAll
        ]
    },
    [EXTERNAL_USER]: {
        [NAVIGATION_FULL_TUTORIAL]: [
            ...sharedFullNavigationForAll,
            'invitePeople', 'headerPerformance', 'connectionStatus',
            'moreActions',
            'moveVirtualBackground', 'moreShortcutsBtn'
        ],
        [NAVIGATION_FEATURE_TUTORIAL]: [
            ...sharedFeatureNavigationForAll
        ]
    },
    [WIZYCONF_HW_NAME]: {
        [NAVIGATION_FULL_TUTORIAL]: [
            'audio', 'video', 'chat', 'raiseHand', 'tileView'
        ],
        [NAVIGATION_FEATURE_TUTORIAL]: [
            'pinParticipant'
        ]
    }
};

export const listAllNavigations = {
    // base navigations
    'audio': {
        title: 'Mic',
        combineLangKey: [
            {
                key: 'addPermission',
                visibility: !Env.isWizyconf()
            },
            {
                key: 'audio',
                visibility: true
            },
            {
                key: 'selectAudioSource',
                visibility: !Env.isWizyconf()
            }
        ],
        'selector': [ '.audio-preview', '#audio-settings-button' ],
        'selectorTooltip': '.audio-preview',
        'tooltipPosition': {
            placement: 'top'
        }
    },
    'video': {
        title: 'Camera',
        combineLangKey: [
            {
                key: 'video',
                visibility: true
            },
            {
                key: 'selectVideoSource',
                visibility: !Env.isWizyconf()
            }
        ],
        'selector': [ '.video-preview', '.video-preview .settings-button-small-icon' ],
        'selectorTooltip': '.video-preview',
        'tooltipPosition': {
            placement: 'top'
        }
    },
    'shareScreen': {
        title: 'Share your screen.',
        'selector': '.toolbox-button.shareYourScreen',
        'tooltipPosition': {
            placement: 'top'
        }
    },
    'chat': {
        title: 'Chat',
        'selector': '.toolbox-button.chat',
        'tooltipPosition': {
            placement: 'top'
        }
    },
    'raiseHand': {
        title: 'Share attitude and feedback',
        'selector': [ '.toolbox-button.raisehand', '#reactions-menu-button' ],
        'tooltipPosition': {
            placement: 'top'
        }
    },
    'reactions': {
        title: 'Reactions',
        'selector': '.reactions-menu-container',
        'tooltipPosition': {
            placement: 'top'
        },
        'transitionDelay': 200,
        runAction: [
            {
                actionDispatch: toggleReactionsMenuVisibility,
                actionName: 'toggleReactionsMenuVisibility'
            },
            {
                actionDispatch: setGifMenuVisibility,
                actionName: 'setGifMenuVisibility',
                params: false
            }
        ],
        closeAction: [
            {
                actionDispatch: toggleReactionsMenuVisibility,
                actionName: 'toggleReactionsMenuVisibility'
            }
        ]
    },
    'connectionStatus': {
        title: 'Connection status',
        'selector': '#participant-connection-indicator',
        transitionSelector: '.filmstrip',
        getSateFromStore: {
            name: 'features/filmstrip',
            value: 'visible'
        },
        'tooltipPosition': {
            placement: 'left-start'
        },
        toggleCustomClass: [
            {
                className: '#participant-connection-indicator',
                addClassName: 'display_inline-block',
                removeClassName: 'display_inline-block'
            }
        ],
        runAction: [
            {
                actionDispatch: setFilmstripVisible,
                actionName: 'setFilmstripVisible',
                params: true
            }
        ]
    },
    'moreActions': {
        title: 'More Actions',
        'selector': '.toolbox-button.moreactions',
        'tooltipPosition': {
            placement: 'auto'
        }
    },
    'moreRecording': {
        'title': 'Start recording',
        'selector': '.context-menu .recording',
        'tooltipPosition': {
            placement: 'left'
        },
        scrollToElement: true,
        typeRole: PARTICIPANT_ROLE.MODERATOR,
        getSateFromStore: {
            name: 'features/toolbox',
            value: 'overflowMenuVisible'
        },
        runAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: true
            }
        ],
        closeAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: false
            }
        ]
    },
    'moreMuteEveryone': {
        'title': 'Mute Everyone',
        'selector': '.context-menu .muteeveryone',
        'tooltipPosition': {
            placement: 'left'
        },
        scrollToElement: true,
        typeRole: PARTICIPANT_ROLE.MODERATOR,
        getSateFromStore: {
            name: 'features/toolbox',
            value: 'overflowMenuVisible'
        },
        runAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: true
            }
        ],
        closeAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: false
            }
        ]
    },
    'moveVirtualBackground': {
        'title': 'Virtual background',
        'selector': '.context-menu .selectbackground',
        'tooltipPosition': {
            placement: 'left'
        },
        scrollToElement: true,
        getSateFromStore: {
            name: 'features/toolbox',
            value: 'overflowMenuVisible'
        },
        runAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: true
            }
        ],
        closeAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: false
            }
        ]
    },
    'popupModerator': {
        'selector': '.moderator-settings-wrapper',
        'transitionSelector': '.css-1oc7v0j',
        'tooltipPosition': {
            placement: 'auto'
        },
        typeRole: PARTICIPANT_ROLE.MODERATOR,
        runAction: [
            {
                actionDispatch: openSettingsDialog,
                actionName: 'openSettingsDialog',
                params: SETTINGS_TABS.MODERATOR
            }
        ],
        closeAction: [
            {
                actionDispatch: hideDialog,
                actionName: 'hideDialog'
            }
        ]
    },
    'moreShortcutsBtn': {
        'selector': '.shortcuts',
        'tooltipPosition': {
            placement: 'auto'
        },
        getSateFromStore: {
            name: 'features/toolbox',
            value: 'overflowMenuVisible'
        },
        scrollToElement: true,
        runAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: true
            }
        ],
        closeAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: false
            }
        ]
    },

    'tileView': {
        title: 'Toggle tile view',
        'selector': '.toolbox-button.tileview',
        'tooltipPosition': {
            placement: 'auto'
        }
    },
    'invitePeople': {
        title: 'Invite people',
        'selector': '.toolbox-button.invite',
        'tooltipPosition': {
            placement: 'auto'
        }
    },
    'headerPerformance': {
        title: 'Performance settings',
        'selector': '#videoResolutionLabel',
        'tooltipPosition': {
            placement: 'auto'
        },
        runAction: [
            {
                actionDispatch: setTileView,
                actionName: 'setTileView',
                params: false
            }
        ]
    },
    'toggleFullScreen': {
        title: 'Full screen',
        'selector': '.toolbox-content .button-fullscreen',
        'tooltipPosition': {
            placement: 'right-end'
        }
    },
    'conversationInfo': {
        title: 'Conversation info',
        'selector': '.button-info',
        'tooltipPosition': {
            placement: 'left-start'
        }
    },

    // new feature navigations
    'popupHints': {
        title: 'Sales conversations hints',
        'selector': '.hints-tab',
        'transitionSelector': '.css-1oc7v0j',
        'tooltipPosition': {
            placement: 'auto'
        },
        typeRole: PARTICIPANT_ROLE.MODERATOR,
        runAction: [
            {
                actionDispatch: openSettingsDialog,
                actionName: 'openSettingsDialog',
                params: 'hints'
            }
        ],
        closeAction: [
            {
                actionDispatch: hideDialog,
                actionName: 'hideDialog'
            }
        ]
    },
    'sidebarSize': {
        title: 'Sidebar size',
        'selector': '.dragHandle',
        transitionSelector: '.filmstrip',
        getSateFromStore: {
            name: 'features/filmstrip',
            value: 'visible'
        },
        'tooltipPosition': {
            placement: 'left'
        },
        toggleCustomClass: [
            {
                className: '.dragHandleContainer',
                addClassName: 'visible',
                removeClassName: 'visible'
            }
        ],
        runAction: [
            {
                actionDispatch: setFilmstripVisible,
                actionName: 'setFilmstripVisible',
                params: true
            },
            {
                actionDispatch: setTileView,
                actionName: 'setTileView',
                params: false
            }
        ]
    },
    'pinParticipant': {
        title: 'Pin a user',
        'selector': '.filmstrip',
        transitionSelector: '.filmstrip',
        getSateFromStore: {
            name: 'features/filmstrip',
            value: 'visible'
        },
        'tooltipPosition': {
            placement: 'left'
        },
        runAction: [
            {
                actionDispatch: setFilmstripVisible,
                actionName: 'setFilmstripVisible',
                params: true
            },
            {
                actionDispatch: setTileView,
                actionName: 'setTileView',
                params: false
            }
        ],
        toggleCustomClass: [
            {
                className: '.resizable-filmstrip',
                cssStyleAdd: 'background: rgba(152,165,174,.12)!important;backdrop-filter: blur(22px);',
                cssStyleRemove: [ 'background', 'backdrop-filter' ]
            },
            {
                className: '.toolbox-content',
                cssStyleAdd: 'opacity: 0;',
                cssStyleRemove: [ 'opacity' ]
            }
        ]
    },

    // Unused
    'popupHideSelf': {
        title: 'Find self view.',
        'selector': '.settings-sub-pane-element:nth-child(3)',
        'transitionSelector': '.css-1oc7v0j',
        'tooltipPosition': {
            placement: 'left'
        },
        scrollToElement: true,
        runAction: [
            {
                actionDispatch: openSettingsDialog,
                actionName: 'openSettingsDialog',
                params: SETTINGS_TABS.MORE
            }
        ],
        closeAction: [
            {
                actionDispatch: hideDialog,
                actionName: 'hideDialog'
            }
        ]
    },
    'popupSpeakerStats': {
        title: 'Sales conversations hints',
        'selector': '.css-1harwh1',
        'transitionSelector': '.css-1oc7v0j',
        'tooltipPosition': {
            placement: 'auto'
        },
        runAction: [
            {
                actionDispatch: openDialog,
                actionName: 'openDialog',
                params: SpeakerStats,
                paramsObject: { name: 'speakerStats' }
            }
        ],
        closeAction: [
            {
                actionDispatch: hideDialog,
                actionName: 'hideDialog'
            }
        ]
    },
    'morePerformance': {
        'title': 'Performance settings',
        'selector': '.context-menu .callquality',
        'tooltipPosition': {
            placement: 'left'
        },
        scrollToElement: true,
        getSateFromStore: {
            name: 'features/toolbox',
            value: 'overflowMenuVisible'
        },
        runAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: true
            }
        ],
        closeAction: [
            {
                actionDispatch: setOverflowMenuVisible,
                actionName: 'setOverflowMenuVisible',
                params: false
            }
        ]
    },
    'localVideo': {
        'selector': '#localVideoWrapper',
        'tooltipPosition': {
            placement: 'left-start'
        },
        runAction: [
            {
                actionDispatch: setTileView,
                actionName: 'setTileView',
                params: false
            }
        ]
    },
    'unpinButtonHW': {
        title: 'Toggle full screen',
        'selector': '.wizyconf-unpin-button',
        'tooltipPosition': {
            placement: 'top'
        }
    }
};
