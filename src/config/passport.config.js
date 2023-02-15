import passport from "passport";
import local from "passport-local";
import GithubStrategy from "passport-github2";
import userModel from "../dao/models/users.model.js";
import { createHash, isValidPassword } from "../utils.js";

const localStrategy = local.Strategy;

const initPassport = () => {
  passport.use(
    "register",
    new localStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      async (req, username, password, done) => {
        try {
          const { first_name, last_name, email, age } = req.body;
          if (!first_name || !last_name || !email || !age || !password)
            return res.status(400).json({
              status: "error",
              error: "Todos los campos deben ser rellenados",
            });

          const user = await userModel.findOne({ email: username });

          if (user) {
            console.log("User already exists");
            return done(null, false);
          }

          const newUser = {
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          };

          const result = await userModel.create(newUser);
          return done(null, result);
        } catch (error) {
          return done("[LOCAL] Error al obtener usuario " + error);
        }
      }
    )
  );

  passport.use(
    "login",
    new localStrategy(
      {
        usernameField: "email",
      },
      async (username, password, done) => {
        try {
          if (
            username === "adminCoder@coder.com" &&
            password === "adminCod3r123"
          ) {
            const admin = {
              email: username,
              password,
              first_name: "Admin",
              last_name: "Coder",
              age: 26,
              role: "admin",
            };
            return done(null, admin);
          }

          const user = await userModel.findOne({ email: username });

          if (!user) {
            console.log("Invalid User");
            return done(null, user);
          }

          if (!isValidPassword(user, password)) return done(null, false);
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.use(
    "github",
    new GithubStrategy(
      {
        clientID: "Iv1.f0ec593f6296224a",
        clientSecret: "950753c04d89fc54bc5d6092dd6be52369565cd0",
        callbackURL: "http://127.0.0.1:8080/api/sessions/githubcallback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });

          if (!user) {
            const newUser = {
              first_name: profile._json.name,
              last_name: "",
              age: 0,
              email: profile._json.email,
              password: "",
            };

            const result = await userModel.create(newUser);
            return done(null, result);
          }
          done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};

passport.serializeUser((user, done) => {
  done(null, user._id);
});
passport.deserializeUser(async (id, done) => {
  const user = await userModel.findById(id);
  done(null, user);
});

export default initPassport;
