"use client";

import withAuthPage from "@/lib/hoc/with-auth-page";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useState } from "react";
import { useFetchCursor } from "@/hooks/use-fetch-cursor";
import AssignedBranchAccounting from "./_components/assigned-branch-accounting";
import PostItem from "@/components/post-item";

function Profile() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    data: posts,
    isLoading,
    cursor,
    fetchData,
    handleCursor,
    scrollToTopRef,
  } = useFetchCursor({ url: "/owned-posts" });

  const ROLES_CARD = {
    [ROLE.AREA_MANAGER]: (
      <AssignedAreaManager branches={user?.assigned_area_managers} />
    ),
    [ROLE.AUTOMATION]: <AssignedBranch branches={user?.assigned_branches} />,
    [ROLE.CAS]: <AssignedBranchCas branches={user?.assigned_branch_cas} />,
    [ROLE.ACCOUNTING_HEAD]: (
      <div className="space-y-2">
        <AssignedCategory categories={user?.assigned_categories} />
        <AssignedBranchAccounting
          branches={user?.accounting_assigned_branches}
        />
      </div>
    ),
    [ROLE.ACCOUNTING_STAFF]: (
      <div className="space-y-2">
        <AssignedCategory categories={user?.assigned_categories} />
        <AssignedBranchAccounting
          branches={user?.accounting_assigned_branches}
        />
      </div>
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

  return (
    <div className="min-h-screen pb-12">
      <div className="h-70 bg-chat-background w-full"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                <Avatar className="h-24 w-24 border-4 border-blue-300">
                  <AvatarImage
                    src={Storage(user?.user_detail?.profile_pic)}
                    alt={user.full_name}
                  />
                  <AvatarFallback className="text-2xl bg-linear-to-r from-blue-500 to-purple-600 text-white">
                    {nameShortHand(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center">
                  <CardTitle className="text-2xl capitalize font-bold dark:text-white text-gray-700">
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
              <CardDescription className="text-blue-400">
                {`@${user.username}`}
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

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm dark:text-white text-gray-500">
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
      <EditProfile open={isOpen} setOpen={setIsOpen} profile={user} />
    </div>
  );
}

export default withAuthPage(Profile);
