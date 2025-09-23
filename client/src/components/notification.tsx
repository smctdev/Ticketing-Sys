import { BellDotIcon, BellOffIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import nameShortHand from "@/utils/name-short-hand";
import { formatDistanceToNowStrict } from "date-fns";
import { Button } from "./ui/button";
import { useEffect, useRef, useState } from "react";
import echo from "@/lib/echo";
import Storage from "@/utils/storage";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ViewTicketDetails } from "@/app/(views)/tickets/_components/view-ticket-details";

interface DataItems {
  id: string;
  created_at: string;
  read_at: string;
  data: {
    message: string;
    full_name: string;
    user_profile: string;
    ticket_code: string;
  };
}

interface NotificationProps {
  totalUnreadNotifications: number;
  notifications: DataItems[];
}

export default function Notification({
  totalUnreadNotifications,
  notifications,
}: NotificationProps) {
  const { user, setNotifications, setTotalUnreadNotifications } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenView, setIsOpenView] = useState<boolean>(false);
  const [selectedTicketData, setSelectedTicketData] = useState<null | any>(
    null
  );
  const [open, setOpen] = useState<boolean>(false);
  const toastDisplay = useRef<null>(null);

  useEffect(() => {
    if (!echo || !user) return;

    echo
      .private(`App.Models.UserLogin.${user?.login_id}`)
      .notification((notification: any) => {
        setNotifications((prev: any) => {
          if (prev.some((item: any) => item.id === notification.id)) {
            return prev;
          }
          toastDisplay.current = notification;
          return [notification, ...prev];
        });

        if (toastDisplay.current) {
          toast.info("New Notification", {
            description: notification.data.message,
            duration: 5000,
            position: "top-center",
          });
          toastDisplay.current = null;
        }

        setTotalUnreadNotifications(notification.unread_notification_count);
      });

    return () => {
      echo.leave(`private-App.Models.UserLogin.${user?.login_id}`);
    };
  }, [echo, user]);

  const markAsReadNotification =
    (id: string, ticket_code: string) => async () => {
      try {
        const response = await api.patch(`/notifications/${id}/mark-as-read`);
        if (response.status === 200) {
          setNotifications((prev: any) => {
            return prev.filter((item: any) => item.id !== id);
          });
          setTotalUnreadNotifications((prev: number) => prev - 1);
          await handleViewTicket(ticket_code);
          setOpen(false);
        }
      } catch (error: any) {
        console.error(error);
      }
    };

  const markAllAsReadNotification = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch(`/notifications/mark-all-as-read`);

      if (response.status === 200) {
        setNotifications([]);
        setTotalUnreadNotifications(0);
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTicket = async (id: any) => {
    try {
      const response = await api.get(`/view-ticket/${id}/view`);
      if (response.status === 200) {
        setSelectedTicketData(response.data.data);
        setIsOpenView(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mr-3">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger>
          <div className="relative">
            <BellDotIcon />
            {totalUnreadNotifications > 0 && (
              <Badge
                className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums text-white absolute -top-2 -right-3 text-xs"
                variant="destructive"
              >
                {totalUnreadNotifications > 9 ? "9+" : totalUnreadNotifications}
              </Badge>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[350px] mr-5">
          <DropdownMenuLabel className="text-gray-600 font-bold text-md">
            Notifications
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length > 0 ? (
            <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto">
              {notifications.map((notification, index: number) => (
                <div
                  key={index}
                  className={`flex gap-3 items-center p-4 relative cursor-pointer ${
                    notification.read_at
                      ? " hover:bg-gray-100"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={markAsReadNotification(
                    notification.id,
                    notification.data.ticket_code
                  )}
                >
                  <Avatar>
                    <AvatarImage
                      src={Storage(notification.data.user_profile)}
                    />
                    <AvatarFallback className="font-bold">
                      {nameShortHand(notification.data.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-gray-700">
                      {notification.data.full_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notification.data.message}
                    </p>
                  </div>
                  <span className="absolute top-0 right-1 text-xs text-gray-400 font-bold">
                    {formatDistanceToNowStrict(notification.created_at, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 space-y-3">
              <BellOffIcon className="mx-auto size-10 text-gray-500" />
              <h3 className="text-lg font-bold text-gray-500">
                No new notifications
              </h3>
            </div>
          )}
          {totalUnreadNotifications > 0 && (
            <div className="w-full pt-1">
              <Button
                type="button"
                variant={"outline"}
                className="w-full"
                disabled={isLoading}
                onClick={markAllAsReadNotification}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Mark all as read"
                )}
              </Button>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <ViewTicketDetails
        data={selectedTicketData}
        open={isOpenView}
        setOpen={setIsOpenView}
      />
    </div>
  );
}
