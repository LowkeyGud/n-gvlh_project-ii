import Answer from "@/components/forms/Answer";
import AllAnswers from "@/components/shared/AllAnswers";
import Metric from "@/components/shared/Metric";
import NoResult from "@/components/shared/NoResult";
import ParseHTML from "@/components/shared/ParseHTML";
import RenderTag from "@/components/shared/RendredTag";
import Votes from "@/components/shared/Votes";
import {
  getQuestionById,
  getQuestionByIdAndIncreaseViews,
} from "@/lib/actions/question.action";
import { getUserById } from "@/lib/actions/user.action";
import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import { URLProps } from "@/types";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

const QuestionDetailPage = async ({ params, searchParams }: any) => {
  const { userId: clerkId } = auth();

  let mongoUser;

  if (clerkId) {
    mongoUser = await getUserById({ userId: clerkId });
  }
  const question = await getQuestionByIdAndIncreaseViews({
    questionId: params.id,
  });

  if (!question) {
    return (
      <NoResult
        title="Question Not Found"
        description="This question doesn't exist or has been deleted by the author"
        linkTitle="Go To Homepage"
        link="/"
      />
    );
  }

  return (
    <>
      <div className="flex-start w-full flex-col">
        <div className="flex w-full flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-2">
          <Link
            href={`/profile/${question.author.clerkId}`}
            className="flex items-center justify-start gap-1"
          >
            <Image
              src={question.author.picture}
              alt="profile"
              className="rounded-full"
              width={22}
              height={22}
            />
            <p className="paragraph-semibold text-dark300_light700">
              {question.author.name}
            </p>
          </Link>

          <div className="flex justify-end">
            <Votes
              type="Question"
              itemId={JSON.stringify(question._id)}
              userId={JSON.stringify(mongoUser?._id)}
              upvotes={question.upvotes.length}
              hasupVoted={question.upvotes.includes(mongoUser._id)}
              downvotes={question.downvotes.length}
              hasdownVoted={question.downvotes.includes(mongoUser._id)}
              hasSaved={mongoUser?.saved.includes(question._id)}
            />
          </div>
        </div>

        <h2 className="h2-semibold text-dark200_light900 mt-3.5 w-full text-left">
          {question.title}
        </h2>
      </div>

      <div className="mb-8 mt-5 flex flex-wrap gap-4">
        <Metric
          imgUrl="/qna/time.svg"
          alt="clock icon"
          value={` Asked ${getTimestamp(question.createdAt)}`}
          title=""
          textStyles="small-medium text-dark400_light800"
        />

        <Metric
          imgUrl="/qna/answers.svg"
          alt="message"
          value={formatAndDivideNumber(question.answers.length)}
          title="Answers"
          textStyles="small-medium text-dark400_light800"
        />

        <Metric
          imgUrl="/qna/view.svg"
          alt="eye"
          value={formatAndDivideNumber(question.views)}
          title="Views"
          textStyles="small-medium text-dark400_light800"
        />
      </div>

      <div>
        <ParseHTML data={question.content} />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {question.tags.map((tag: any) => (
          <RenderTag
            key={tag._id}
            _id={tag._id}
            name={tag.name}
            showCount={false}
          />
        ))}
      </div>

      <AllAnswers
        questionId={question._id}
        userId={mongoUser._id}
        totalAnswers={question.answers.length}
        filter={searchParams.filter}
        page={searchParams?.page}
      />

      {/* Just Giving a height like flutter sizedbox😝 */}

      <div className="h-3"></div>

      <Answer
        question={question.content}
        questionId={JSON.stringify(question._id)}
        authorId={JSON.stringify(mongoUser._id)}
      />
    </>
  );
};

export async function generateMetadata({ params }: URLProps) {
  const question = await getQuestionById({
    questionId: params.id,
  });

  if (!question) return;

  return {
    title: `${question.title}`,
  };
}

export default QuestionDetailPage;
