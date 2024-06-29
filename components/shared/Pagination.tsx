"use client";

import { formUrlQuery } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "../ui/button";

interface Props {
  pageNumber: number;
  hasNext: boolean;
}

const Pagination = ({ pageNumber, hasNext }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (direction: string) => {
    const nextPageNumber =
      direction === "prev" ? pageNumber - 1 : pageNumber + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: nextPageNumber.toString(),
    });

    router.push(newUrl);
  };
  if (!hasNext && pageNumber === 1) return null;

  return (
    <div className="mt-10 flex w-full items-center justify-center gap-2">
      <Button
        size="sm"
        variant="ghost"
        disabled={pageNumber === 1}
        onClick={() => handleNavigation("prev")}
        className="light-border-2 flex min-h-[36px] items-center justify-center gap-2 border"
      >
        <p className="body-medium text-dark200_light800">Prev</p>
      </Button>

      <div className="flex items-center justify-center rounded-md px-3.5 py-2">
        <p className="body-semibold text-dark-500">{pageNumber}</p>
      </div>

      <Button
        size="sm"
        variant="ghost"
        disabled={!hasNext}
        onClick={() => handleNavigation("next")}
        className="light-border-2 flex min-h-[36px] items-center justify-center gap-2 border"
      >
        <p className="body-medium">Next</p>
      </Button>
    </div>
  );
};

export default Pagination;
