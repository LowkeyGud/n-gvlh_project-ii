import { AnswerFilters } from "@/constants/filters";
import { getAnswers } from "@/lib/actions/answer.action";
import { getTimestamp } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import EditDeleteAction from "./EditDeleteAction";
import Filter from "./Filter";
import Pagination from "./Pagination";
import ParseHTML from "./ParseHTML";
import Votes from "./Votes";


interface Props {
  questionId: string;
  userId: string;
  totalAnswers: number;
  page?: number;
  filter?: string;
}

const AllAnswers = async ({
  questionId,
  userId,
  totalAnswers,
  page,
  filter,
}: Props) => {
  const { answers, hasNext } = await getAnswers({
    questionId,
    sortBy: filter,
    page: page ? +page : 1,
  });

  return (
    <div className="mt-11">
      <div className="flex items-center justify-between">
        <h3 className="primary-text-gradient">{totalAnswers} Answers</h3>

        <Filter filters={AnswerFilters} />
      </div>

      <div>
        {answers.map((answer) => (
          <article key={answer._id} className="light-border border-b py-10">
            <div className="mb-2 flex flex-col-reverse justify-between gap-5 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href={`/profile/${answer.author.clerkId}`}
                className="flex flex-1 items-start gap-1 sm:items-center"
              >
                <Image
                  src={answer.author.picture}
                  width={18}
                  height={18}
                  alt="profile"
                  className="rounded-full object-cover max-sm:mt-0.5"
                />
                <div className="flex flex-col sm:flex-row sm:items-center">
                  <p className="body-semibold text-dark300_light700 mr-3">
                    {answer.author.name}
                  </p>

                  <p className="small-regular text-light400_light500 ml-0.5 mt-0.5 line-clamp-1">
                    answered {getTimestamp(answer.createdAt)}
                  </p>
                </div>
              </Link>
              <div className="flex gap-2">
                <SignedIn>
                  {userId &&
                    userId.toString() === answer.author._id.toString() && (
                      <EditDeleteAction
                        type="Answer"
                        itemId={JSON.stringify(answer._id)}
                      />
                    )}
                </SignedIn>
                <Votes
                  type="Answer"
                  itemId={JSON.stringify(answer._id)}
                  userId={JSON.stringify(userId)}
                  upvotes={answer.upvotes.length}
                  hasupVoted={answer.upvotes.includes(userId)}
                  downvotes={answer.downvotes.length}
                  hasdownVoted={answer.downvotes.includes(userId)}
                />
              </div>
            </div>
            <ParseHTML data={answer.content} />
          </article>
        ))}
      </div>
      <Pagination pageNumber={page ? +page : 1} hasNext={hasNext} />
    </div>
  );
};

export default AllAnswers;
