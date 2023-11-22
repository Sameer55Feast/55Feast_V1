import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
} from "../../utils/index.js";
import { mealModel, userModel } from "../../models/index.js";

const bookYourMeal = async (request, response) => {
  try {
    const { email, date } = request.body;
    let meal = await mealModel.mealModel.findOne({ email });
    if (!meal) {
      console.log("here");
      meal = new mealModel.mealModel({ email, bookedDates: [date] });
    } else {
      if (meal.bookedDates.includes(date)) {
        return sendResponse(
          onError(409, messageResponse.MEAL_ALREADY_BOOKED),
          response
        );
      }
      const currentMonth = new Date(date).getMonth() + 1;
      const firstDateMonth = new Date(meal.bookedDates[0]).getMonth() + 1;
      if (
        currentMonth - firstDateMonth >= 2 ||
        currentMonth - firstDateMonth == -10
      ) {
        meal.bookedDates = meal.bookedDates.filter((date) => {
          const currDate = new Date(date);
          const currMonth = currDate.getMonth() + 1;
          return currMonth != firstDateMonth;
        });
      }
      meal.bookedDates.push(date);
    }
    await meal.save();
    return sendResponse(
      onSuccess(201, messageResponse.MEAL_BOOKED, meal),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const bookMultipleMeals = async (request, response) => {
  try {
    const { email, bookedDates } = request.body;
    let meal = await mealModel.mealModel.findOne({ email });
    if (!meal) {
      meal = new mealModel.mealModel({ email, bookedDates });
    } else {
      for (const date of bookedDates) {
        if (meal.bookedDates.includes(date)) {
          return sendResponse(
            onError(409, messageResponse.MEAL_ALREADY_BOOKED),
            response
          );
        }
      }
      const currentMonth = new Date(bookedDates[0]).getMonth() + 1;
      const firstDateMonth = new Date(meal.bookedDates[0]).getMonth() + 1;
      if (
        currentMonth - firstDateMonth >= 2 ||
        currentMonth - firstDateMonth == -10
      ) {
        meal.bookedDates = meal.bookedDates.filter((date) => {
          const currDate = new Date(date);
          const currMonth = currDate.getMonth() + 1;
          return currMonth != firstDateMonth;
        });
      }
      meal.bookedDates = meal.bookedDates.concat(bookedDates);
    }
    await meal.save();
    return sendResponse(
      onSuccess(201, messageResponse.MEAL_BOOKED, meal),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const cancelMeal = async (request, response) => {
  try {
    const { email, date } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(400, messageResponse.INVALID_USER), response);
    }
    const mealFound = await mealModel.mealModel.findOne({ email: user.email });
    if (!mealFound) {
      return sendResponse(
        onError(404, messageResponse.MEAL_NOT_BOOKED),
        response
      );
    }
    if (mealFound.bookedDates.includes(date)) {
      const index = mealFound.bookedDates.indexOf(date);
      mealFound.bookedDates.splice(index, 1);
      await mealFound.save();
      return sendResponse(
        onSuccess(200, messageResponse.COUNT_CANCELLED, mealFound),
        response
      );
    }
    return sendResponse(
      onError(404, messageResponse.MEAL_NOT_BOOKED, mealFound),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getCountsOfUser = async (request, response) => {
  try {
    const { email } = request.query;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(400, messageResponse.INVALID_USER), response);
    }
    const mealFound = await mealModel.mealModel.findOne({ email: user.email });
    if (!mealFound) {
      const newEntity = new mealModel.mealModel({
        email,
        bookedDates: [],
      });
      await newEntity.save();
      return sendResponse(
        onSuccess(200, messageResponse.BOOK_YOUR_FIRST_MEAL, newEntity),
        response
      );
    }
    return sendResponse(
      onSuccess(
        200,
        messageResponse.DATE_FETCHED_SUCCESS,
        mealFound.bookedDates
      ),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getAllCountOfDate = async (request, response) => {
  try {
    const { date } = request.body;
    const { location } = request.query;
    const foundUsers = await mealModel.mealModel.find({
      bookedDates: { $in: [date] },
    });
    const users = foundUsers.map(async (element) => {
      const foundUser = await userModel.findOne({ email: element.email });
      return {
        fullName: `${foundUser.firstName} ${foundUser.lastName}`,
        email: element.email,
        location: foundUser.location,
      };
    });
    const result = await Promise.all(await users);
    const count = result.filter((user) => user.location === `${location}`);
    return sendResponse(
      onSuccess(200, messageResponse.DATE_FETCHED_SUCCESS, count),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getLastFiveCounts = async (request, response) => {
  try {
    const { location } = request.query;
    const lastFiveDay = [];
    const currentDate = new Date();
    for (let i = 1; lastFiveDay.length < 5; i++) {
      const day = new Date(currentDate);
      day.setDate(day.getDate() - i);
      if (day.getDay() !== 6 && day.getDay() !== 0) {
        lastFiveDay.push(day.toISOString().split("T")[0]);
      }
    }
    const lastFiveDayCounts = lastFiveDay.map(async (element) => {
      return {
        count: await getCounts(element, location),
        date: element,
        day: getDayByDate(element),
      };
    });
    return sendResponse(
      onSuccess(
        200,
        messageResponse.COUNTS_FETCHED_SUCCESS,
        await Promise.all(lastFiveDayCounts.reverse())
      ),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getDayByDate = (dateToBeUsed) => {
  const date = new Date(dateToBeUsed);
  const options = { weekday: "long" };
  const dayName = date.toLocaleDateString("en-US", options);
  return dayName;
};

const getCounts = async (date, location) => {
  const foundUsers = await mealModel.mealModel.find({
    bookedDates: { $in: [date] },
  });
  const users = foundUsers.map(async (element) => {
    const foundUser = await userModel.findOne({ email: element.email });
    return { email: element.email, location: foundUser?.location };
  });
  const result = await Promise.all(await users);
  const count = result.filter((user) => user.location === location);
  return count.length;
};

const cancelAllMealsOfDate = async (request, response) => {
  try {
    const { date } = request.query;
    const foundUsers = await mealModel.mealModel.find({
      bookedDates: { $in: [date] },
    });
    foundUsers.map(async (element) => {
      if (element.bookedDates.includes(date)) {
        const index = element.bookedDates.indexOf(date);
        element.bookedDates.splice(index, 1);
        await element.save();
      }
    });
    return sendResponse(
      onSuccess(200, messageResponse.COUNTS_DELETED_SUCCESS),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getTodayNotCountedUsers = async (request, response) => {
  try {
    const today = new Date();
    const day = new Date(today);
    const date = day.toISOString().split("T")[0];
    const foundUsers = await mealModel.mealModel.find({
      bookedDates: { $nin: [date] },
    });
    const users = foundUsers.map(async (element) => {
      const foundUser = await userModel.findOne({email: element.email});
      return { fullName: `${foundUser.firstName} ${foundUser.lastName}`, email: element.email };
    });
    return sendResponse(
      onSuccess(
        200,
        messageResponse.DATE_FETCHED_SUCCESS,
        await Promise.all(await users)
      ),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const getMonthlyCounts = async (request, response) => {
  try {
    const { location } = request.query;
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEndDate = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth() + 1,
      0
    );
    const datesOfLastMonth = [];
    for (let i = lastMonth.getDate(); i <= lastMonthEndDate.getDate(); i++) {
      const year = lastMonth.getFullYear();
      const month =
        lastMonth.getMonth() + 1 <= 9
          ? `0${lastMonth.getMonth() + 1}`
          : lastMonth.getMonth() + 1;
      const day = i <= 9 ? `0${i}` : i;
      const formattedDate = `${year}-${month}-${day}`;
      const weekDay = new Date(formattedDate).getDay();
      if (weekDay !== 6 && weekDay !== 0) {
        datesOfLastMonth.push(`${year}-${month}-${day}`);
      }
    }
    const lastMonthCounts = datesOfLastMonth.map(async (element) => {
      const result = {
        count: await getCounts(element, location),
        date: element,
        day: getDayByDate(element),
      };
      const newMonthlyMeal = new mealModel.monthlyMealModel(result);
      await newMonthlyMeal.save();
      return result;
    });
    return sendResponse(
      onSuccess(
        200,
        messageResponse.COUNTS_FETCHED_SUCCESS,
        await Promise.all(lastMonthCounts)
      ),
      response
    );
  } catch (error) {}
};

export default {
  bookYourMeal,
  bookMultipleMeals,
  cancelMeal,
  getCountsOfUser,
  getAllCountOfDate,
  getLastFiveCounts,
  cancelAllMealsOfDate,
  getTodayNotCountedUsers,
  getMonthlyCounts,
};
