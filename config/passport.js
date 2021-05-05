const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')

const User = require('../databases/schema/user')

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({ usernameField: 'mobile' }, (mobile, password, done) => {
            // Match user
            User.findOne({
                mobile: mobile
            }).then(user => {
                if (!user) {
                    return done(null, false, { message: 'That mobile is not registered' });
                }

                // Match password
                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                });
            });
        })
    );

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
};