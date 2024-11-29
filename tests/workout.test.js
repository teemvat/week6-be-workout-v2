const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/userModel");
const Workout = require("../models/workoutModel");
const workouts = require("./data/workouts.js");

let token = null;

beforeAll(async () => {
  await User.deleteMany({});
  const result = await api
    .post("/api/user/signup")
    .send({ email: "mattiv@matti.fi", password: "R3g5T7#gh" });
  token = result.body.token;
});

describe("workout tests", () => {
  describe("when there is initially some workouts saved", () => {

    beforeEach(async () => {
      await Workout.deleteMany({});
      await api
        .post("/api/workouts")
        .set("Authorization", "bearer " + token)
        .send(workouts[0]);
      await api
        .post("/api/workouts")
        .set("Authorization", "bearer " + token)
        .send(workouts[1]);
    });

    describe("getting all workouts", () => {
      it("Workouts are returned as json", async () => {
        await api
          .get("/api/workouts")
          .set("Authorization", "bearer " + token)
          .expect(200)
          .expect("Content-Type", /application\/json/);
      });
    });

    describe("adding a new workout", () => {
      it("New workout added successfully", async () => {
        const newWorkout = {
          title: "testworkout",
          reps: 10,
          load: 100,
        };
        await api
          .post("/api/workouts")
          .set("Authorization", "bearer " + token)
          .send(newWorkout)
          .expect(201);
      });
    });

    describe("getting a specific workout", () => {
      it("Workout is returned as json", async () => {
        const workoutsAtStart = await api
          .get("/api/workouts")
          .set("Authorization", "bearer " + token);
        const workoutToView = workoutsAtStart.body[0];
        const result = await api
          .get(`/api/workouts/${workoutToView._id}`)
          .set("Authorization", "bearer " + token)
          .expect(200)
          .expect("Content-Type", /application\/json/);
        expect(result.body.title).toEqual(workoutToView.title);
      });
    });

    describe("updating a workout", () => {
      it("Workout updated successfully", async () => {
        const workoutsAtStart = await api
          .get("/api/workouts")
          .set("Authorization", "bearer " + token);
        const workoutToUpdate = workoutsAtStart.body[0];
        const updatedWorkout = {
          title: "updatedworkout",
          reps: 10,
          load: 100,
        };
        await api
          .patch(`/api/workouts/${workoutToUpdate._id}`)
          .set("Authorization", "bearer " + token)
          .send(updatedWorkout)
          .expect(200);
      });
    });

    describe("deleting a workout", () => {
      it("Workout deleted successfully", async () => {
        const workoutsAtStart = await api
          .get("/api/workouts")
          .set("Authorization", "bearer " + token);
        const workoutToDelete = workoutsAtStart.body[0];
        await api
          .delete(`/api/workouts/${workoutToDelete._id}`)
          .set("Authorization", "bearer " + token)
      });
    });
  });

  afterAll(() => {
    mongoose.connection.close();
  });
});
