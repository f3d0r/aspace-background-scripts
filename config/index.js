module.exports = {
    express: {
        RESPONSE_TIMEOUT_MILLI: 10000
    },
    twilio: {
        TWILIO_ACCOUNT_SID: 'twilio_sid',
        TWILIO_AUTH_TOKEN: 'twilio_auth_token',
        ORIGIN_PHONE: 'twilio_origin_phone_number'
    },
    mysql_config: {
        ADMIN_TABLE: 'aspace_admins'
    },
    auth: {
        PIN_EXPIRY_MINUTES: 5,
        INTERNAL_AUTH_KEY: '***REMOVED***'
    },
    bcrypt: {
        SALT_ROUNDS: 10
    },
    sensors: {
        sensorDeltaFeet: 2
    },
    slack: {
        webhook: '***REMOVED***'
    },
    db: {
        DATABASE_USER: 'api',
        DATABASE_PASSWORD: 'db_password',
        DATABASE_NAME: 'aspace',
        DATABASE_IP: 'db_ip',
        DATABASE_PORT: 'db_port'
    },
    geojson: {
        settings: {
            Point: ['lat', 'lng']
        }
    },
    mapbox: {
        API_KEY: '***REMOVED***'
    },
    optimize: {
        DRIVE_PARK: '***REMOVED***',
        PARK_BIKE: '***REMOVED***',
        PARK_WALK: '***REMOVED***',
        time_threshold: 600,
        cluster_distance_threshold: 0.1
    },
    sessions: {
        update_interval: 15000,
        end_session_threshold: 10 // minutes
    }
};