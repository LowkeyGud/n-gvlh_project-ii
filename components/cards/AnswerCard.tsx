import Link from "next/link";

import { formatAndDivideNumber, getTimestamp } from "@/lib/utils";
import { SignedIn } from "@clerk/nextjs";
import parse from "html-react-parser";
import EditDeleteAction from "../shared/EditDeleteAction";
import Metric from "../shared/Metric";

interface Props {
  clerkId?: string | null;
  _id: string;
  answer: string;
  question: {
    _id: string;
    title: string;
  };
  author: {
    _id: string;
    clerkId: string;
    name: string;
    picture: string;
  };
  upvotes: number;
  createdAt: Date;
}

const AnswerCard = ({
  clerkId,
  _id,
  question,
  answer,
  author,
  upvotes,
  createdAt,
}: Props) => {
  const showActionButtons = clerkId && clerkId === author.clerkId;
  return (
    <div className="card-wrapper rounded-[10px] p-9 max-sm:p-3 sm:px-5">
      <Link href={`/question/${question._id}/#${_id}`} passHref legacyBehavior>
        <div>
          <div className="flex flex-col-reverse items-start justify-between gap-5 sm:flex-row">
            <div>
              <span className="subtle-regular text-dark400_light700 line-clamp-1 flex sm:hidden">
                {getTimestamp(createdAt)}
              </span>
              <h3 className="sm:h3-semibold base-semibold text-dark200_light900 line-clamp-2 flex-1">
                {question.title}
              </h3>
              {parse(answer.slice(0, 230))}
            </div>
            <SignedIn>
              {showActionButtons && (
                <EditDeleteAction type="Answer" itemId={JSON.stringify(_id)} />
              )}
            </SignedIn>
          </div>
          <div className="flex-between mt-6 w-full flex-wrap gap-3">
            <Metric
              imgUrl={author.picture}
              alt="user avatar"
              value={author.name}
              title={` • asked ${getTimestamp(createdAt)}`}
              href={`/profile/${author.clerkId}`}
              textStyles="body-medium text-dark400_light700"
              isAuthor
            />
            <div className="flex-center gap-3">
              <Metric
                imgUrl="/qna/like.svg"
                alt="like icon"
                value={formatAndDivideNumber(upvotes)}
                title=" Votes"
                textStyles="small-medium text-dark400_light800"
              />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default AnswerCard;