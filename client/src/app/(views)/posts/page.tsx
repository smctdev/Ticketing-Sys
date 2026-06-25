"use client";

import withAuthPage from "@/lib/hoc/with-auth-page";
import { useFetchCursor } from "@/hooks/use-fetch-cursor";
import PostItem from "@/components/post-item";

function Posts() {
  const {
    data: posts,
    isLoading,
    cursor,
    fetchData,
    handleCursor,
    scrollToTopRef,
  } = useFetchCursor({ url: "/posts" });

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <PostItem
          data={posts}
          isLoading={isLoading}
          cursor={cursor}
          fetchData={fetchData}
          handleCursor={handleCursor}
          scrollToTopRef={scrollToTopRef}
        />
      </div>
    </div>
  );
}

export default withAuthPage(Posts);
