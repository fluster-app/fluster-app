import {environment} from '../../../../environments/environment';

export class Resources {

    static get Constants(): any {

        // Peter Parker
        const peterParkerUrl: string = environment.peterParkerUrl;
        const peterParkerVersion: string = 'v1';
        const websiteUrl: string = environment.websiteUrl;
        const pwaUrl: string = environment.pwaUrl; // A last slash is mandatory for Facebook redirect login process
        const domain: string = environment.domain;

        // Amazon
        const s3Url: string = 'https://peterparker-photos-eu.s3.dualstack.eu-west-1.amazonaws.com';

        // Google
        const googleApiUrl: string = 'https://maps.googleapis.com/maps/api/geocode/json';

        // Spotify
        const spotifyConnectUrl: string = 'https://accounts.spotify.com/authorize';
        const spotifyRedirectUrl: string = 'fluster://app/spotify/'; // Deep linking

        // Deeplink with URI scheme
        const itemDeeplinkUrl: string = 'fluster://app/item/';

        // Third party keys
        const peterParkerAuthKey: string = '{{AUTH_KEY}}';
        const facebookAppId: string = '{{FACEBOOK_APP_ID}}';
        const googleProjectNumber: string = '{{GOOGLE_PROJECT_NUMBER}}';
        const googleApiKey: string = '{{GOOGLE_API_KEY}}';
        const googleAnalyticsKey: string = '{{GOOGLE_ANALYTICS_TRACKER_ID}}';
        const googleWebClientId: string = '{{GOOGLE_LOGIN_WEB_CLIENT_ID}}';
        const sentryDsn: string = '{{SENTRY_DSN}}';
        const spotifyClientId: string = '{{SPOTIFY_CLIENT_ID}}';

        return {
            APP_VERSION: '5.1.3',

            GITHUB: {
                URL: 'https://github.com/fluster/fluster-app'
            },

            API: {
                SERVER_DOMAIN: peterParkerUrl,
                FACEBOOK_MOBILE_LOGIN: peterParkerUrl + '/' + peterParkerVersion + '/api/auth/facebook/mobile',
                FACEBOOK_PWA_LOGIN: peterParkerUrl + '/' + peterParkerVersion + '/api/auth/facebook/pwa',
                GOOGLE_LOGIN: peterParkerUrl + '/' + peterParkerVersion + '/api/auth/google/mobile',
                GOOGLE_PWA_LOGIN: peterParkerUrl + '/' + peterParkerVersion + '/api/auth/google/pwa',
                LOGOUT: peterParkerUrl + '/' + peterParkerVersion + '/api/auth/logout',
                LOGIN: peterParkerUrl + '/' + peterParkerVersion + '/api/auth/login',
                ITEMS: peterParkerUrl + '/' + peterParkerVersion + '/items/',
                ITEM_USERS: peterParkerUrl + '/' + peterParkerVersion + '/itemusers/',
                MYITEMS: peterParkerUrl + '/' + peterParkerVersion + '/myitems/',
                ITEMS_MYOFFEREDITEMS: peterParkerUrl + '/' + peterParkerVersion + '/myoffereditems/',
                APPOINTMENTS: peterParkerUrl + '/' + peterParkerVersion + '/appointments/',
                APPLICANTS: peterParkerUrl + '/' + peterParkerVersion + '/applicants/',
                MY_APPLICANTS: peterParkerUrl + '/' + peterParkerVersion + '/myapplicants/',
                DEEPLINK_APPLICANT: peterParkerUrl + '/' + peterParkerVersion + '/deeplinkapplicant/',
                STATUS_APPLICANTS: peterParkerUrl + '/' + peterParkerVersion + '/statusapplicants/',
                IMAGES_SIGNED_URL: peterParkerUrl + '/' + peterParkerVersion + '/api/images/',
                YELP: peterParkerUrl + '/' + peterParkerVersion + '/yelp/',
                GOOGLE_SEARCH_PLACE_NEARBY: peterParkerUrl + '/' + peterParkerVersion + '/google/searchPlaceNearby',
                GOOGLE_SEARCH_PLACE: peterParkerUrl + '/' + peterParkerVersion + '/google/searchPlace',
                GOOGLE_SEARCH_PLACE_DETAILS: peterParkerUrl + '/' + peterParkerVersion + '/google/placeDetails',
                PROFILES: peterParkerUrl + '/' + peterParkerVersion + '/profiles/',
                NOTIFICATIONS: peterParkerUrl + '/' + peterParkerVersion + '/notifications/',
                STATISTICS: peterParkerUrl + '/' + peterParkerVersion + '/statistics/',
                CITIES: peterParkerUrl + '/' + peterParkerVersion + '/cities/',
                COMPLAINTS: peterParkerUrl + '/' + peterParkerVersion + '/complaints/',
                LIKES: peterParkerUrl + '/' + peterParkerVersion + '/likes/',
                PUSH_NOTIFICATIONS: peterParkerUrl + '/' + peterParkerVersion + '/push/',
                VOUCHER_ITEMS: peterParkerUrl + '/' + peterParkerVersion + '/voucheritems/',
                CHATS: peterParkerUrl + '/' + peterParkerVersion + '/chats/',
                CHATS_MESSAGES: peterParkerUrl + '/' + peterParkerVersion + '/chats/messages/',
                CHATS_MESSAGES_UNREAD: peterParkerUrl + '/' + peterParkerVersion + '/chats/messages/unread/',
                DEVICES: peterParkerUrl + '/' + peterParkerVersion + '/devices/',
                PRODUCTS: peterParkerUrl + '/' + peterParkerVersion + '/products/',
                SUBSCRIPTIONS: peterParkerUrl + '/' + peterParkerVersion + '/subscriptions/',
                CANDIDATES: peterParkerUrl + '/' + peterParkerVersion + '/candidates/',
                STARS: peterParkerUrl + '/' + peterParkerVersion + '/stars/',
                SPOTIFY: peterParkerUrl + '/' + peterParkerVersion + '/spotify/',
                EDUCATIONS: peterParkerUrl + '/' + peterParkerVersion + '/educations/',
                EMPLOYERS: peterParkerUrl + '/' + peterParkerVersion + '/employers/',
                REWARDS: peterParkerUrl + '/' + peterParkerVersion + '/rewards/',
                PAGINATION: {
                    LIMIT_ITEMS: 4,
                    LOAD_NEXT_ITEMS: 2,
                    COMMON: 10,
                    CHAT: 10,
                    LANGUAGES: 20
                },
                AUTH_KEY: peterParkerAuthKey
            },

            LOGIN: {
                STATE: {
                    TOKEN_EXPIRED: 'token_expired',
                    TOKEN_OK: 'token_ok',
                    NO_TOKEN: 'no_token'
                },
                PWA: {
                    DOMAIN: domain
                }
            },

            TERMS_OF_USE: {
                URL: websiteUrl + '/termsofuse'
            },

            AWS: {
                S3_URL: s3Url
            },

            TIME_OUT: {
                LOGIN: 10000,
                CURRENT_LOCATION: 10000,
                NOTIFICATION: {
                    DISPLAY: 8000,
                    DISPLAY_SHORT: 6000,
                    DISPLAY_FIRST_MSG_SHORT: 9000,
                    DISPLAY_FIRST_MSG: 12000,
                    FADE_OUT: 2000
                }
            },

            FACEBOOK: {
                APP_ID: facebookAppId,
                API_VERSION: 'v3.0',
                SCOPE: ['public_profile', 'email', 'user_birthday', 'user_location', 'user_likes', 'user_gender'],
                PWA: {
                    URL: 'https://www.facebook.com/',
                    REDIRECT_URL: pwaUrl
                }
            },

            GOOGLE: {
                PROJECT: {
                    NUMBER: googleProjectNumber
                },
                API: {
                    URL: googleApiUrl,
                    KEY: googleApiKey
                },
                LOGIN: {
                    WEB_CLIENT_ID: googleWebClientId,
                    SCOPES: 'https://www.googleapis.com/auth/user.birthday.read',
                    PWA: {
                        URL: 'https://accounts.google.com/o/oauth2/v2/auth?',
                        REDIRECT_URL: pwaUrl
                    },
                },
                MAP: {
                    OWN_STYLE_NAME: 'Fluster'
                },
                ANALYTICS: {
                    TRACKER_ID: googleAnalyticsKey,
                    TRACKER: {
                        VIEW: {
                            LOGIN: 'login',
                            ADS: {
                                ADS_NEXT_APPOINTMENTS: 'ads_next_appointments',
                                ADS_STATISTICS: 'ads_statistics',
                                ADS_DETAILS: 'ads_details',
                                ADS_CLOSE: 'ads_close',
                                ADS_EXTEND: 'ads_extend',
                                APPPLICANT_SELECTION: 'applicant_selection',
                                APPLICANTS: 'applicants',
                                CANDIDATES: {
                                    CANDIDATES: 'candidates',
                                    CANDIDATES_DETAILS: 'candidates_details'
                                },
                                WIZARD: {
                                    NEW_AD: 'new_ad',
                                    EDIT_AD: 'edit_ad'
                                },
                                ADMIN: {
                                    APPOINTMENTS: 'admin_appointments',
                                    LIMITATION: 'admin_limitation'
                                }
                            },
                            FIRST_CHOICE: 'first_choice',
                            FIRST_LOCATION: 'first_location',
                            ITEMS: {
                                ITEM_PARAMS: 'item_params',
                                ITEMS: 'items',
                                ITEM_DETAILS: 'item_details',
                                MY_BOOKMARKS: 'my_bookmarks',
                                MY_APPOINTMENTS: 'my_appointments',
                                MY_PENDING_REQUESTS: 'my_pending_requests'
                            },
                            USER_PROFILE: 'user_profile',
                            APP_PARAMS: 'app_params'
                        },
                        EVENT: {
                            CATEGORY: {
                                LOGIN: 'login',
                                LOGOUT: 'logout',
                                MODAL: 'modal',
                                SHARE: 'share',
                                ADS: {
                                    ADS: 'ads',
                                    WIZARD: 'wizard',
                                    CANDIDATES: 'candidates'
                                },
                                PARAMS: {
                                    FIRST_LOCATION: 'fist_location'
                                },
                                ITEMS: 'items',
                                MY_BOOKMARKS: 'my_bookmarks',
                                MY_APPOINTMENTS_OR_APPLICANTS: 'my_appointments_or_applicants',
                                OTHER: 'other',
                                FIRST_CHOICE: 'first_choice'
                            },
                            ACTION: {
                                LOGIN_FB_SUCCESS: 'facebook_login_success',
                                LOGIN_FB_PWA_SUCCESS: 'facebook_login_pwa_success',
                                LOGIN_GOOGLE_SUCCESS: 'google_login_success',
                                LOGIN_GOOGLE_SILENT_SUCCESS: 'google_login_silent_success',
                                LOGIN_GOOGLE_PWA_SUCCESS: 'google_login_pwa_success',
                                LOGIN_FLUSTER_SUCCESS: 'fluster_login_success',
                                ERROR_LOGIN: {
                                    AUTOMATIC_LOGIN: 'error_automatic_login',
                                    FACEBOOK_LOGIN: 'error_facebook_login',
                                    GOOGLE_LOGIN: 'error_google_login',
                                    AUTOMATIC_GOOGLE_LOGIN: 'error_google_automatic_login',
                                    FACEBOOK_STATUS_LOGIN: 'error_facebook_status_login',
                                    NO_RESPONSE_CONTENT: 'error_no_response_content',
                                    PETERPARKER_LOGIN: 'error_peterparker_login',
                                    FACEBOOK_PWA_LOGIN: 'error_facebook_pwa_login',
                                    GOOGLE_PWA_LOGIN: 'error_google_pwa_login'
                                },
                                LOGOUT: 'logout',
                                DELETE_ACCOUNT: 'delete_account',
                                SHARE_CALLED: 'share_called',
                                ADS: {
                                    DELETE: 'delete',
                                    EXTEND: 'extend',
                                    EDIT_END: 'edit_end',
                                    EDIT_LIMITATION: 'edit_limitation',
                                    UNDO: 'undo',
                                    APPLICANT: {
                                        APPLICANT_DETAILS: 'applicants_details',
                                        APPLICANT_SELECT: 'applicant_select',
                                        APPLICANT_DECLINE: 'applicant_decline',
                                        APPLICANT_RESCHEDULE: 'applicant_reschedule',
                                        APPLICANT_APPOINTMENTS: 'applicant_appointments'
                                    },
                                    WIZARD: {
                                        STEP_TYPE: 'step_type',
                                        STEP_LOCATION: 'step_location',
                                        STEP_PHOTO: 'step_photo',
                                        STEP_APPOINTMENTS: 'step_appointments',
                                        STEP_ATTENDANCE: 'step_availability',
                                        STEP_ATTRIBUTES: 'step_attributes',
                                        STEP_AVAILABILITY: 'step_availability',
                                        STEP_LIMITATION: 'step_limitation',
                                        STEP_PRICE: 'step_price',
                                        STEP_SHARE_SIZE: 'step_share_size',
                                        STEP_SIZE: 'step_size',
                                        STEP_LIFESTYLE: 'step_lifestyle',
                                        PUBLISH: {
                                            PUBLISH_CALLED: 'publish_called',
                                            UPDATE_CALLED: 'edit_called',
                                            PUBLISH_DONE: 'publish_done',
                                            UPDATE_DONE: 'edit_done',
                                            PUBLISH_ERROR: 'publish_error',
                                            UPDATE_ERROR: 'edit_error'
                                        }
                                    },
                                    ADVERTISER_DETAILS: 'advertiser_details_ads',
                                    YELP_DETAILS: 'yelp_details'
                                },
                                PARAMS: {
                                    FIRST_LOCATION_NEXT: 'first_location_next',
                                    SELECT_INTERESTS: 'select_interests'
                                },
                                BROWSE: {
                                    ADVERTISER_DETAILS: 'advertiser_details_browse',
                                    YELP_DETAILS: 'yelp_details',
                                    ITEM_APPOINTMENTS: 'item_appointments',
                                    ITEM_PHONE_REQUEST: 'item_phone_request'
                                },
                                ITEMS: {
                                    LIKE: 'like',
                                    DISLIKE: 'dislike',
                                    REVIEW_DISLIKE: 'review_dislike',
                                    REVIEW_DISLIKE_LATER: 'review_dislike_later',
                                    SPECS: 'item_details_specs',
                                    NEIGHBORHOOD: 'item_details_neighborhood',
                                    CHAT: 'item_details_chat',
                                    SLIDES: {
                                        ADVERTISER: 'item_slides_advertiser',
                                        NO_ADVERTISER: 'item_slides_no_advertiser'
                                    },
                                    UPDATE_BIRTHDAY: 'update_birthday'
                                },
                                CHAT: 'chat',
                                PRODUCT_PICKER: 'product_picker',
                                DATE_PICKER: 'date_picker',
                                PHOTO_PICKER: 'photo_picker',
                                PHOTO_APPLY_FILTER: 'photo_apply_filter',
                                SEARCH_LOCATION: 'search_location',
                                SELECT_HOBBIES: 'select_hobbies',
                                SELECT_LANGUAGES: 'select_languages',
                                SELECT_LIFESTYLE: 'select_lifestyle',
                                SEARCH_WORK_SCHOOL: 'search_work_school',
                                CANDIDATES: {
                                    SUPERSTAR: 'superstar'
                                },
                                OTHER: {
                                    PHOTO_RECOVERY: 'photo_recovery'
                                },
                                FIRST_CHOICE: {
                                    BROWSE: 'first_choice_browse',
                                    BROWSE_MALE: 'first_choice_browse_male',
                                    BROWSE_FEMALE: 'first_choice_browse_female',
                                    BROWSE_UNKNOWN: 'first_choice_browse_unknown',
                                    BROWSE_GENDER_GIVEN: 'first_choice_browse_gender_given',
                                    ADS: 'first_choice_ads'
                                }
                            }
                        }
                    }
                },
                PLACE_API: {
                    RADIUS: 10000,
                    WIDE_RADIUS: 100000,
                    TYPE: {
                        AIRPORT: 'airport',
                        TRAIN_STATION: 'train_station'
                    }
                }
            },

            SENTRY: {
                DSN: sentryDsn
            },

            ITEM: {
                SOURCE: 'fluster',
                STATUS: {
                    NEW: 'new',
                    PUBLISHED: 'published',
                    CLOSED: 'closed',
                    CANCELLED: 'cancelled',
                    BLOCKED: 'blocked',
                    INITIALIZED: 'initialized'
                },
                TYPE: {
                    RENT: 'rent',
                    TAKEOVER: 'takeover',
                    SHARE: 'share',
                    BUY: 'buy'
                },
                USER_RESTRICTIONS: {
                    AGE: {
                        MIN: 18,
                        MAX: 99
                    },
                    GENDER: {
                        MALE: 'male',
                        FEMALE: 'female',
                        IRRELEVANT: 'irrelevant'
                    }
                },
                DETAIL: {
                    TAGS: {
                        BALCONY: 'balcony',
                        GARDEN: 'garden',
                        INTERNET: 'internet',
                        CLEANING_AGENT: 'cleaning_agent'
                    },
                    PARKING: {
                        TYPE: {
                            NONE: 'none',
                            GARAGE: 'garage',
                            PARKING_SPACE: 'parking_space'
                        }
                    },
                    FLOOR: {
                        MIN: -1,
                        MAX: 29
                    },
                    ATTRIBUTES: {
                        MAX_SELECTABLE_ROOMS: 11,
                        MAX_SELECTABLE_FLATMATE: 11,
                        MAX_SELECTABLE_BATHROOMS: 11,
                        MIN_BATHROOMS: 0,
                        DEFAULT_BATHROOMS: 1,
                        DEFAULT_FLATMATE: 2,
                        INCREMENT: {
                            SHARE: 1,
                            FLAT: 1,
                            FLAT_CH: 0.5,
                            SHARED_ROOM: 1,
                            FLATMATE: 1,
                            BATHROOMS: 1
                        }
                    }
                },
                END: {
                    DAYS_BEFORE_WARN: 5,
                    DAYS_EXTEND: 21
                }
            },

            LOCATION: {
                GEO_TYPE: 'Point'
            },

            // See camera and gallery importing jpg aka Cordova Camera.EncodingType.JPEG
            PHOTO: {
                IMG_EXTENSION: '.jpg',
                MIME_TYPE: 'image/jpeg',
                JPG_QUALITY: 0.92, // 0.92 is toDataUrl default
                ARRAY_SIZE: 5,
                LOCAL_SUB_PATH: 'flusterimg' // without / at the end
            },

            // Appointments
            APPOINTMENT: {
                TYPE: {
                    FIXED: 'fixed',
                    OPEN: 'open'
                },
                ATTENDANCE: {
                    MULTIPLE: 'multiple',
                    SINGLE: 'single'
                },
                APPROVAL: {
                    ALL: 'all',
                    SELECT: 'select'
                },
                AGENDA: {
                    TYPE: {
                        TIME_FRAME: 'time_frame',
                        EXACT: 'exact'
                    },

                    SCHEDULE: {
                        TIME_FRAME: {
                            MORNING: {
                                MORNING: 'morning',
                                FIRST_START_TIME_HOURS: 8, // 8 o'clock
                                COUNT: 5 // 8-9h, 9-10h, 10-11h, 11-12h, 12-13h
                            },
                            AFTERNOON: {
                                AFTERNOON: 'afternoon',
                                FIRST_START_TIME_HOURS: 13,
                                COUNT: 5
                            },
                            EVENING: {
                                EVENING: 'evening',
                                FIRST_START_TIME_HOURS: 18,
                                COUNT: 5
                            },
                            START_TIME_MIN: 0, // Should begin at 0 minutes
                            APPOINTMENT_LENGTH: 1 // Length of visit 1 hour
                        }
                    }
                },
                DISPLAY: {
                    ALL_WEEK: 7,
                    MAX_COUNT_WEEKS: 3,
                    DELAY_BEFORE_FIRST_VIEWING: 1, // In hours, first meeting only possible in x hours from now
                    SCROLL_MIDDLE_INDEX: 1.1
                }
            },
            APPLICANT: {
                STATUS: {
                    NEW: 'new',
                    ACCEPTED: 'accepted',
                    CANCELLED: 'cancelled',
                    TO_RESCHEDULE: 'to_reschedule',
                    SELECTED: 'selected',
                    REJECTED: 'rejected'
                },
                AGENDA: {
                    STATUS: {
                        NEW: 'new',
                        ACCEPTED: 'accepted',
                        CANCELLED: 'cancelled'
                    }
                },
                CANCELLATION: {
                    REASON: {
                        NOT_ENOUGH_DETAILS: 'not_enough_details',
                        NO_COMMON_INTERESTS: 'no_common_interests',
                        FOUND_SOMEONE_ELSE: 'found_someone_else',
                        NO_REASON: 'no_reason'
                    }
                }
            },

            SOCIAL_SHARING: {
                FLUSTER_WEBSITE: websiteUrl,
                FLUSTER_SHARE_IMG: {
                    URL: {
                        STANDARD: websiteUrl + '/images/share/fluster_1200x630',
                        SQUARE: websiteUrl + '/images/share/fluster_1080x1080',
                    },
                    EXT: '.png'
                },
                FLUSTER_SHARE_DEFAULT_HASHTAG: '#fluster',
                ITEM_URL: websiteUrl + '/item/'
            },

            USER: {
                INTEREST: {
                    TYPE: {
                        WORK: 'work',
                        TRAIN: 'train',
                        SCHOOL: 'school',
                        AIRPORT: 'airport',
                        LOVE: 'love',
                        TRAINING: 'training'
                    },
                    TRAVEL_MODE: {
                        BICYCLING: 'bicycling',
                        DRIVING: 'driving',
                        TRANSIT: 'transit',
                        WALKING: 'walking'
                    },
                    TRAVEL_TIME: {
                        MIN: 1,
                        MAX: 120
                    },
                    MAIN_TRAIN_STATION: 'main+train+station',
                    AIRPORT: 'airport',
                    MAX_USER_SELECTION: 3
                },
                STATUS: {
                    INITIALIZED: 'initialized',
                    ACTIVE: 'active',
                    CLOSE: 'close',
                    DELETED: 'deleted',
                    BLOCKED: 'blocked'
                },
                ADDRESS: {
                    DEFAULT_DISTANCE: 99
                },
                ITEM: {
                    PRICE: {
                        MIN: 0,
                        MAX: 3999
                    }
                },
                LIFESTYLE: {
                    CLEANLINESS: ['clean', 'average', 'messy'],
                    GUESTS: ['never', 'rarely', 'occasionally', 'often'],
                    PARTY: ['rarely', 'occasionally', 'weekends', 'daily'],
                    FOOD: ['anything', 'vegetarian', 'vegan', 'gluten', 'halal', 'kosher', 'paleolithic', 'fruitarian']
                },
                HOBBIES: {
                    SPORTS: ['soccer', 'ice_hockey', 'running', 'yoga', 'dancing', 'skiing', 'snowboarding', 'surfing', 'horse_riding', 'tennis', 'golfing', 'climbing', 'swimming', 'rowing', 'basketball', 'crossfit', 'biking', 'handball', 'field_hockey', 'ping_pong', 'badminton', 'boxing', 'martial_arts', 'ice_skating', 'fishing', 'rugby'],
                    ARTS: ['movies', 'tv_shows', 'video_games', 'performing_arts', 'reading', 'drawing', 'guitar', 'musical_keyboard', 'singing', 'drums', 'saxophone', 'trumpet', 'violin'],
                    FOOD: ['cooking', 'coffee', 'wine', 'beer'],
                    PLACES: ['mountain', 'beach', 'camping', 'shopping']
                },
                GENDER: {
                    MALE: 'male',
                    FEMALE: 'female'
                }
            },

            NOTIFICATION: {
                TYPE: {
                    APPLICATION_NEW: 'application_new',
                    APPLICATION_ACCEPTED: 'application_accepted',
                    APPLICATION_TO_RESCHEDULE: 'application_to_reschedule',
                    CHAT_NEW_MESSAGE: 'chat_new_message',
                    CHAT_UPDATE_MESSAGE: 'chat_update_message',
                    DEVICE_UPDATE: 'device_update',
                    SUPERSTAR_NEW: 'superstar_new',
                    APPOINTMENT_RESCHEDULED: 'appointment_rescheduled'
                }
            },

            COMPLAINT: {
                INAPPROPRIATE: 'inappropriate',
                FAKE: 'fake',
                DIDNT_SHOW_UP: 'didnt_show_up'
            },

            STATISTICS: {
                TARGETED_USERS: {
                    // https://github.com/mongodb/mongo/blob/v3.2.3/docs/errors.md
                    // 16389 code aggregation result exceeds maximum document size (MB)
                    MONGO_ERR_CODE_AGGREGATION_MAX_EXCEEDS: 16389,
                    MIN_TARGETED_USERS: 50,
                    MAX_TARGETED_USERS: 1000
                }
            },

            LANGUAGE: {
                MAX_SELECTED_LANGUAGES: 5
            },

            PRODUCT: {
                DURATION: {
                    TYPE: {
                        MONTHS: 'months',
                        DAYS: 'days'
                    }
                },
                STATUS: {
                    INITIALIZED: 'initialized',
                    ACKNOWLEDGED: 'acknowledged',
                    ACTIVE: 'active',
                    REJECTED: 'rejected'
                }
            },

            SUBSCRIPTION: {
                STATUS: {
                    INITIALIZED: 'initialized',
                    ACKNOWLEDGED: 'acknowledged',
                    ACTIVE: 'active',
                    REJECTED: 'rejected'
                }
            },

            SPOTIFY: {
                CONNECT_URL: spotifyConnectUrl,
                REDIRECT_URL: spotifyRedirectUrl,
                CLIENT_ID: spotifyClientId,
                RESPONSE_TYPE: 'code', // Constant
                SCOPE: 'user-top-read' // Separated with spaces
            },

            DEEPLINK: {
                MARKETING_TITLE: {
                    ITEM: 'Item'
                },
                URL_SCHEME: {
                    ITEM: itemDeeplinkUrl
                }
            }
        };
    }
}
