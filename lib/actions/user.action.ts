"use server";

import Answer from "@/database/answer.modal";
import Question from "@/database/question.modal";
import Tag from "@/database/tag.modal";
import User from "@/database/user.modal";
import { BadgeCriteriaType } from "@/types";
import { FilterQuery } from "mongoose";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../mongoose";
import { assignBadges } from "../utils";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  GetSavedQuestionsParams,
  GetUserByIdParams,
  GetUserStatsParams,
  ToggleSaveQuestionParams,
  UpdateUserParams,
} from "./shared.types";
import { createForum } from "./forum.action";

export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDatabase();

    const { page = 1, pageSize = 10, filter, searchQuery } = params;

    const query: FilterQuery<typeof User> = {};

    const skipAmount = (page - 1) * pageSize;

    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;
      case "teachers":
        query.role = "TEACHER";
        break;
      default:
        break;
    }

    const users = await User.find(query)
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const totalUsers = await User.countDocuments(query);

    const hasNext = totalUsers > skipAmount + pageSize;

    return { users, hasNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserById(params: any) {
  try {
    await connectToDatabase();

    const { userId } = params;

    const user = await User?.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.log("Database connnection failed: ", error);
  }
}

export async function createUser(userData: CreateUserParams) {
  try {
    connectToDatabase();

    const newUser = await User.create(userData);

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    connectToDatabase();

    const { clerkId, updateData, path } = params;

    await User.findOneAndUpdate({ clerkId }, updateData, {
      new: true,
    });

    revalidatePath(path);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteUser(params: DeleteUserParams) {
  try {
    connectToDatabase();

    const { clerkId } = params;

    const user = await User.findOneAndDelete({ clerkId });

    if (!user) {
      throw new Error("User not found!");
    }

    // TODO => Get user question id to delete them

    // Delete User Questions
    await Question.deleteMany({ author: user._id });

    // TODO! => delete user answers, comments, etc

    const deletedUser = await User.findByIdAndDelete(user._id);

    return deletedUser;
  } catch (error) {
    console.log(error);
  }
}

export async function toggleSaveQuestion(params: ToggleSaveQuestionParams) {
  try {
    connectToDatabase();

    const { userId, questionId, path } = params;

    const user = await User.findById(userId);

    if (!user) {
      throw Error("User not found!");
    }

    const isQuestionSaved = user.saved.includes(questionId);

    if (isQuestionSaved) {
      // remove question from saved
      await User.findByIdAndUpdate(
        userId,
        { $pull: { saved: questionId } },
        { new: true },
      );
    } else {
      // add question to saved
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { saved: questionId } },
        { new: true },
      );
    }

    revalidatePath(path);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();

    const { clerkId, searchQuery, filter, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};

    let sortOptions = {};

    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;

      case "oldest":
        sortOptions = { createdAt: 1 };
        break;

      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;

      default:
        break;
    }

    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        skip: skipAmount,
        // pageSize+1 to find if there are other questions and compute hasNext based on that
        limit: pageSize + 1,
        sort: sortOptions,
      },
      populate: [
        { path: "author", model: User, select: "_id clerkId name picture" },
        { path: "tags", model: Tag, select: "_id name" },
      ],
    });

    const hasNext = user.saved.length > pageSize;

    if (!user) {
      throw new Error("User not found");
    }

    const savedQuestions = user.saved;

    return { questions: savedQuestions, hasNext };
    //
  } catch (error) {
    //
    console.log(error);

    throw error;
  }
}

export async function getUserInfo(params: GetUserByIdParams) {
  try {
    connectToDatabase();

    const { userId } = params;

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return;
      // throw new Error("User not found!");
    }

    const totalQuestions = await Question.countDocuments({ author: user._id });
    const totalAnswers = await Answer.countDocuments({ author: user._id });
    const [questionUpvotes] = await Question.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);
    const [answerUpvotes] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $project: {
          _id: 0,
          upvotes: { $size: "$upvotes" },
        },
      },
      {
        $group: {
          _id: null,
          totalUpvotes: { $sum: "$upvotes" },
        },
      },
    ]);
    const [questionViews] = await Answer.aggregate([
      { $match: { author: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
        },
      },
    ]);

    const criteria = [
      { type: "QUESTION_COUNT" as BadgeCriteriaType, count: totalQuestions },
      { type: "ANSWER_COUNT" as BadgeCriteriaType, count: totalAnswers },
      {
        type: "QUESTION_UPVOTES" as BadgeCriteriaType,
        count: questionUpvotes?.totalUpvotes || 0,
      },
      {
        type: "ANSWER_UPVOTES" as BadgeCriteriaType,
        count: answerUpvotes?.totalUpvotes || 0,
      },
      {
        type: "TOTAL_VIEWS" as BadgeCriteriaType,
        count: questionViews?.totalViews || 0,
      },
    ];

    const badgeCounts = assignBadges({ criteria });

    return {
      user,
      totalQuestions,
      totalAnswers,
      badgeCounts,
      reputation: user.reputation,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserQuestions(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalQuestions = await Question.countDocuments({ author: userId });
    const userQuestions = await Question.find({ author: userId })
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort({ createdAt: -1, views: -1, upvotes: -1 });

    const hasNext = totalQuestions > skipAmount + userQuestions.length;

    return { questions: userQuestions, hasNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserAnswers(params: GetUserStatsParams) {
  try {
    connectToDatabase();

    const { userId, page = 1, pageSize = 10 } = params;

    const skipAmount = (page - 1) * pageSize;

    const totalAnswers = await Answer.countDocuments({ author: userId });
    const userAnswers = await Answer.find({ author: userId })
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture")
      .skip(skipAmount)
      .limit(pageSize)
      .sort({ upvotes: -1 });

    const hasNext = totalAnswers > skipAmount + userAnswers.length;

    return { answers: userAnswers, hasNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function changeRole({
  clerkId,
  newRole,
}: {
  clerkId: string;
  newRole: "STUDENT" | "TEACHER";
}) {
  try {
    // Validate the new role
    const validRoles = ["STUDENT", "TEACHER"];
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role specified.");
    }

    connectToDatabase()

    // Find the user by ID and update the role
    const user = await User.findOneAndUpdate(
      { clerkId },
      { role: newRole, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if(user.role === "TEACHER"){
      await createForum({teacherId: user.clerkId});
    }

    if (!user) {
      throw new Error("User not found.");
    }

  } catch (error) {
    console.error(`Error updating user role: ${error}`);
    throw error;
  }
}
export async function changePicture({
  clerkId,
  picture,
}: {
  clerkId: string;
  picture: string;
}) {
  try {
    // Find the user by ID and update the role
    const user = await User.findOneAndUpdate(
      { clerkId },
      { picture, updatedAt: Date.now() },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new Error("User not found.");
    }
  } catch (error) {
    console.error(`Error updating user role: ${error}`);
    throw error;
  }
}

export async function isProfileTeacher({
  userId,
}: {
  userId: string;
}): Promise<boolean> {
  await connectToDatabase();
  const teacher = await User?.findOne({
    clerkId: userId,
    role: "TEACHER",
  });
  if (teacher) {
    return true;
  }
  return false;
}
export async function isTeacher({
  userId,
}: {
  userId: string | null | undefined;
}): Promise<boolean> {
  if (userId === null || userId === undefined) return false;
  await connectToDatabase();
  const teacher = await User?.findOne({
    clerkId: userId,
    role: "TEACHER",
  });

  if (teacher) {
    return true;
  }
  return false;
}
