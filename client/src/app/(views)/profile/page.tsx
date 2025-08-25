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
import {
  Edit,
  Heart,
  MessageSquare,
  Share,
  Building,
  UserCog,
  ChartBarStacked,
} from "lucide-react";
import nameShortHand from "@/utils/name-short-hand";
import { useAuth } from "@/context/auth-context";
import { ROLE } from "@/constants/roles";
import AssignedAreaManager from "./_components/assigned-area-manager";
import AssignedBranch from "./_components/assigned-branch";
import AssignedBranchCas from "./_components/assigned-branch-cas";
import AssignedCategory from "./_components/assigned-category";

function Profile() {
  const { user } = useAuth();

  const posts = [
    {
      id: 1,
      content:
        "Just launched a new design system for our product! So proud of the team for making this happen.",
      likes: 42,
      comments: 8,
      shares: 3,
      time: "2 hours ago",
    },
    {
      id: 2,
      content:
        "Beautiful day for some photography in the Golden Gate Park. The light was just perfect!",
      likes: 128,
      comments: 14,
      shares: 7,
      time: "1 day ago",
    },
    {
      id: 3,
      content:
        "Working on a new mobile app interface. Can't wait to share some sneak peeks with you all soon!",
      likes: 56,
      comments: 5,
      shares: 2,
      time: "3 days ago",
    },
  ];

  const CardDisplay = () => {
    switch (user?.user_role?.role_name) {
      case ROLE.AREA_MANAGER:
        return <AssignedAreaManager branches={user?.assigned_area_managers} />;
      case ROLE.AUTOMATION:
        return <AssignedBranch branches={user?.assigned_branches} />;
      case ROLE.CAS:
        return <AssignedBranchCas branches={user?.assigned_branch_cas} />;
      case ROLE.ACCOUNTING_HEAD:
      case ROLE.ACCOUNTING_STAFF:
        return <AssignedCategory branches={user?.assigned_categories} />;
      default:
        "";
    }
  };

  const isDisplayCards = () => {
    switch (user?.user_role?.role_name) {
      case ROLE.AREA_MANAGER:
      case ROLE.AUTOMATION:
      case ROLE.CAS:
      case ROLE.ACCOUNTING_HEAD:
      case ROLE.ACCOUNTING_STAFF:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 w-full"></div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={user.profile_pic} alt={user.full_name} />
                <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {nameShortHand(user.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex space-x-2">
                <Button
                  variant={"outline"}
                  className="bg-blue-400 hover:bg-blue-300 text-white hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center">
                <CardTitle className="text-2xl capitalize">
                  {user.full_name}
                </CardTitle>
              </div>
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
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-1" />
                {user?.branch?.b_name} ({user?.branch?.b_code})
              </div>
              <div className="flex items-center">
                <UserCog className="h-4 w-4 mr-1" />
                {user?.user_role?.role_name}
              </div>
              <div className="flex items-center">
                <ChartBarStacked className="h-4 w-4 mr-1" />
                {user?.branch?.category}
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
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>AJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-gray-500">{post.time}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p>{post.content}</p>
                  <Separator className="my-3" />
                  <div className="flex justify-between text-gray-500">
                    <Button variant="ghost" size="sm">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 mr-1" />
                      {post.shares}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthPage(Profile);
