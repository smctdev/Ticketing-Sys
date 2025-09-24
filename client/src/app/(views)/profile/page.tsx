"use client";

import withAuthPage from "@/lib/hoc/with-auth-page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Building, UserCog, ChartBarStacked } from "lucide-react";
import nameShortHand from "@/utils/name-short-hand";
import { useAuth } from "@/context/auth-context";
import { ROLE } from "@/constants/roles";
import AssignedAreaManager from "./_components/assigned-area-manager";
import AssignedBranch from "./_components/assigned-branch";
import AssignedBranchCas from "./_components/assigned-branch-cas";
import AssignedCategory from "./_components/assigned-category";
import Storage from "@/utils/storage";
import EditProfile from "./_components/edit-profile";
import { useEffect, useState } from "react";
import { CreatePost } from "./_components/post-dialogs/create-post";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import PostList from "./_components/post-lists";

function Profile() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isRefresh, setisRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<any>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/posts");
        if (response.status === 200) {
          setPosts(response.data.data.data);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [isRefresh]);

  const ROLES_CARD = {
    [ROLE.AREA_MANAGER]: (
      <AssignedAreaManager branches={user?.assigned_area_managers} />
    ),
    [ROLE.AUTOMATION]: <AssignedBranch branches={user?.assigned_branches} />,
    [ROLE.CAS]: <AssignedBranchCas branches={user?.assigned_branch_cas} />,
    [ROLE.ACCOUNTING_HEAD]: (
      <AssignedCategory categories={user?.assigned_categories} />
    ),
    [ROLE.ACCOUNTING_STAFF]: (
      <AssignedCategory categories={user?.assigned_categories} />
    ),
  };

  const CardDisplay = () => {
    return ROLES_CARD[user?.user_role?.role_name] || null;
  };

  const isDisplayCards = () => {
    const allowedRoles = [
      ROLE.AREA_MANAGER,
      ROLE.AUTOMATION,
      ROLE.CAS,
      ROLE.ACCOUNTING_HEAD,
      ROLE.ACCOUNTING_STAFF,
    ];

    return allowedRoles.includes(user?.user_role?.role_name);
  };

  const handleEditProfile = () => {
    setIsOpen(true);
  };
  console.table(posts);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 w-full"></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage
                    src={Storage(user?.user_detail?.profile_pic)}
                    alt={user.full_name}
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    {nameShortHand(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <CardTitle className="text-2xl capitalize">
                    {user.full_name}
                  </CardTitle>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant={"outline"}
                  onClick={handleEditProfile}
                  className="bg-blue-400 hover:bg-blue-300 text-white hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  <span className="hidden lg:block">Edit Profile</span>
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <CardDescription className="text-base">
                {user.username}
              </CardDescription>
              {user?.user_detail?.user_contact && (
                <CardDescription className="text-base">
                  {user?.user_detail?.user_contact}
                </CardDescription>
              )}
              {user?.user_detail?.user_email && (
                <CardDescription className="text-base">
                  {user?.user_detail?.user_email}
                </CardDescription>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
              <div className="flex items-center flex-wrap gap-1">
                <Building className="h-4 w-4 mr-1" />
                {user?.branch ? (
                  <span
                    className={`px-2 py-1 text-[10px] font-medium text-violet-800 bg-violet-100 rounded-full dark:bg-violet-700 dark:text-violet-300`}
                  >
                    {user?.branch?.b_name} ({user?.branch?.b_code})
                  </span>
                ) : (
                  user?.branches?.map((branch: any, index: number) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-[10px] font-medium text-violet-800 bg-violet-100 rounded-full dark:bg-violet-700 dark:text-violet-300`}
                    >
                      {branch?.b_name} ({branch?.b_code})
                    </span>
                  ))
                )}
              </div>
              <div className="flex items-center">
                <UserCog className="h-4 w-4 mr-1" />
                {user?.user_role?.role_name}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                <ChartBarStacked className="h-4 w-4 mr-1" />
                {user?.branch ? (
                  <span
                    className={`px-2 py-1 text-[10px] font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-700 dark:text-yellow-300`}
                  >
                    {user?.branch?.category}
                  </span>
                ) : (
                  user?.branches?.map((branch: any, index: number) => (
                    <span
                      key={index}
                      className={`px-2 py-1 text-[10px] font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-700 dark:text-yellow-300`}
                    >
                      {branch?.category}
                    </span>
                  ))
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div
          className={`${
            isDisplayCards() && "grid grid-cols-1 lg:grid-cols-3"
          } gap-6 mt-6`}
        >
          <div>
            <CardDisplay />
          </div>

          <div className="lg:col-span-2 w-full space-y-3">
            <CreatePost setisRefresh={setisRefresh} />
            {isLoading ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-8 w-8 rounded-full"></Skeleton>
                      <div className="space-y-2">
                        <Skeleton className="text-sm font-semibold h-5 w-46"></Skeleton>
                        <Skeleton className="text-xs text-gray-500 h-3 w-36"></Skeleton>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <Skeleton className="w-full h-5"></Skeleton>
                    <Skeleton className="w-96 h-5"></Skeleton>
                    <Skeleton className="w-full h-5"></Skeleton>
                    <Skeleton className="w-1/2 h-5"></Skeleton>
                    <Skeleton className="w-full h-5"></Skeleton>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-gray-500">
                    <Skeleton className="h-8 w-full mr-1"></Skeleton>
                    <Skeleton className="h-8 w-full mr-1"></Skeleton>
                  </div>
                </CardContent>
              </Card>
            ) : posts?.length > 0 ? (
              posts.map((post: any, index: number) => (
                <PostList key={index} post={post} setisRefresh={setisRefresh} />
              ))
            ) : (
              <p className="text-gray-500 w-full text-center text-xl font-bold mt-10">
                No posts yet
              </p>
            )}
          </div>
        </div>
      </div>
      <EditProfile open={isOpen} setOpen={setIsOpen} profile={user} />
    </div>
  );
}

export default withAuthPage(Profile);
