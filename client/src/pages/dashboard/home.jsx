import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Progress,
} from "@material-tailwind/react";
import { CheckIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { projectsTableData } from "@/data";
import * as XLSX from "xlsx";
import { api } from "@/api/axios";
import {
  UserIcon,
  ChartBarIcon,
  TicketIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/solid";
import { chartsConfig } from "@/configs";
import { useAuth } from "@/context/authContext";

let websiteViewsChart = {
  type: "bar",
  height: 220,
  series: [
    {
      name: "Ticket(s)",
      data: [],
    },
  ],
  options: {
    ...chartsConfig,
    colors: "#fff",
    plotOptions: {
      bar: {
        columnWidth: "16%",
        borderRadius: 5,
      },
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
  },
};

let dailySalesChart = {
  type: "line",
  height: 220,
  series: [
    {
      name: "Ticket(s)",
      data: [],
    },
  ],
  options: {
    ...chartsConfig,
    colors: ["#fff"],
    stroke: {
      lineCap: "round",
    },
    markers: {
      size: 5,
    },
    xaxis: {
      ...chartsConfig.xaxis,
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
  },
};

let completedTasksChart = {
  ...dailySalesChart,
  series: [
    {
      name: "Ticket(s)",
      data: [],
    },
  ],
};

let statisticsCardsData = [];
let statisticsChartsData = [
  {
    color: "blue",
    title: "This Week",
    description: "",
    chart: websiteViewsChart,
  },
  {
    color: "pink",
    title: "This Year",
    description: "",
    chart: dailySalesChart,
  },
  {
    color: "green",
    title: "Last Year",
    description: "",
    chart: completedTasksChart,
  },
];

export function Home() {
  const { user, userRole } = useAuth();
  const username = user?.username;
  const [data, setData] = useState([]);
  const [isNavigate, setIsNavigate] = useState(false);

  if (userRole === 1 || userRole === 2) {
    statisticsCardsData = [
      {
        color: "blue",
        icon: ChartBarIcon,
        title: "Edited This Month",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "than last month",
        },
      },
      {
        color: "green",
        icon: TicketIcon,
        title: "Edited This Week",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "",
        },
      },
      {
        color: "orange",
        icon: TicketIcon,
        title: "Pending Tickets",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "as of today",
        },
      },
      {
        color: "pink",
        icon: UserIcon,
        title: "Total Users",
        value: "",
        footer: {
          color: "text-green-500",
          label: "as of today",
        },
      },
    ];
  } else if (userRole === 4 || userRole === 5) {
    statisticsCardsData = [
      {
        color: "blue",
        icon: ChartBarIcon,
        title: "Ticket This Month",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "than last month",
        },
      },
      {
        color: "green",
        icon: TicketIcon,
        title: "Ticket This Week",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "",
        },
      },
      {
        color: "orange",
        icon: TicketIcon,
        title: "Pending Tickets",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "as of today",
        },
      },
      {
        color: "red",
        icon: ExclamationTriangleIcon,
        title: "Rejected Tickets",
        value: "",
        footer: {
          color: "text-green-500",
          label: "as of today",
        },
      },
    ];
  } else if (
    userRole === 3 ||
    userRole === 7 ||
    userRole === 6 ||
    userRole === 8
  ) {
    statisticsCardsData = [
      {
        color: "blue",
        icon: ChartBarIcon,
        title: "Ticket This Month",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "than last month",
        },
      },
      {
        color: "green",
        icon: TicketIcon,
        title: "Ticket This Week",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "",
        },
      },
      {
        color: "orange",
        icon: TicketIcon,
        title: "Pending Tickets",
        value: "",
        footer: {
          color: "",
          value: "",
          label: "as of today",
        },
      },
    ];
  }

  const [cardsData, setCardsData] = useState(statisticsCardsData);
  const [chartsData, setChartsData] = useState(statisticsChartsData);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);

  useEffect(() => {
    const formattedData = projectsTableData.map((projects, key) => [
      String(key + 1),
      projects.name,
      projects.mostEdited,
      projects.ticketsThisMonth,
      projects.lastMonthPercentage + " %",
      projects.result,
    ]);

    setData(formattedData);
  }, [projectsTableData]);

  const initializeStatistics = async () => {
    if (!userRole) return;
    try {
      const res = await api.get("/dashboard-data");
      const response = res.data;
      const percentage = Number(
        response.percentageThanLastWeek.replace(/,/g, "")
      );
      const percentageLastMonth = Number(
        response.percentageThanLastMonth.replace(/,/g, "")
      );

      statisticsCardsData[2].value = `Total: ${response?.tickets}`;
      statisticsCardsData[1].value = `Total: ${response?.ticketsThisWeek}`;

      if (percentage > 0) {
        statisticsCardsData[1].footer.value = `+${percentage}%`;
        statisticsCardsData[1].footer.color = "text-red-500";
      } else {
        statisticsCardsData[1].footer.value = `${percentage}%`;
        statisticsCardsData[1].footer.color = "text-green-500";
      }

      statisticsCardsData[1].footer.label = "than last week";
      statisticsCardsData[0].value = `Total: ${response.ticketsThisMonth}`;

      if (percentageLastMonth > 0) {
        statisticsCardsData[0].footer.value = `+${percentageLastMonth}%`;
        statisticsCardsData[0].footer.color = "text-red-500";
      } else {
        statisticsCardsData[0].footer.value = `${percentageLastMonth}%`;
        statisticsCardsData[0].footer.color = "text-green-500";
      }

      if (userRole === 4 || userRole === 5) {
        statisticsCardsData[3].value = `Total: ${response.ticketsRejected}`;
      } else if (userRole === 1 || userRole === 2) {
        statisticsCardsData[3].value = `Total: ${response.totalUsers}`;
      }

      websiteViewsChart.series[0].data = response.thisWeekStats.map(
        (item) => item.count
      );
      dailySalesChart.series[0].data = response.thisYearStats.map(
        (item) => item.count
      );
      completedTasksChart.series[0].data = response.thisLastYearStats.map(
        (item) => item.count
      );
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await initializeStatistics();
        setChartsData(statisticsChartsData);
        setCardsData(statisticsCardsData);
        setIsLoadingCharts(true);
        setIsLoading(true);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingCharts(false);
        setIsLoading(false);
        setIsNavigate(true);
      }
    };

    fetchData();
  }, []);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
      [
        "No",
        "Automation",
        "Most Requested",
        "Ticket this month",
        "Ticket Last Month Comparison",
        "Result",
      ],
      ...data,
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "exported_data_automation.xlsx");
  };

  return (
    <div className="mt-12">
      <div className="">
        <Typography>
          Welcome back{" "}
          <b>{username.charAt(0).toUpperCase() + username.slice(1)}</b> ❤️
        </Typography>
      </div>
      <br />
      <br />
      {userRole === 1 ? (
        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-1 xl:grid-cols-4">
          {cardsData.map(({ icon, title, footer, ...rest }, index) => (
            <div key={title}>
              {title === "Rejected Tickets" ||
              (title === "Total Users" && userRole !== 1) ? null : (
                <StatisticsCard
                  title={title}
                  icon={React.createElement(icon, {
                    className: "w-6 h-6 text-white",
                  })}
                  footer={
                    <Typography className="font-normal text-blue-gray-600">
                      {isLoading ? (
                        <div className="loading-text">Loading...</div>
                      ) : (
                        <>
                          <strong className={footer.color}>
                            {footer.value}
                          </strong>
                          &nbsp;{footer.label}
                        </>
                      )}
                    </Typography>
                  }
                  {...(isLoading ? {} : rest)}
                />
              )}
            </div>
          ))}
        </div>
      ) : userRole === 4 || userRole === 5 ? (
        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-1 xl:grid-cols-4">
          {cardsData.map(({ icon, title, footer, ...rest }, index) => (
            <div key={title}>
              {title === "Total Users" && userRole !== 1 ? null : (
                <StatisticsCard
                  title={title}
                  icon={React.createElement(icon, {
                    className: "w-6 h-6 text-white",
                  })}
                  footer={
                    <Typography className="font-normal text-blue-gray-600">
                      {isLoading ? (
                        <div className="loading-text">Loading...</div>
                      ) : (
                        <>
                          <strong className={footer.color}>
                            {footer.value}
                          </strong>
                          &nbsp;{footer.label}
                        </>
                      )}
                    </Typography>
                  }
                  {...(isLoading ? {} : rest)}
                />
              )}
            </div>
          ))}
          <span style={{ paddingBottom: 120 }}>&nbsp;</span>
        </div>
      ) : (
        <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-1 xl:grid-cols-3">
          {cardsData.map(({ icon, title, footer, ...rest }, index) => (
            <div key={title}>
              {title === "Rejected Tickets" ||
              (title === "Total Users" && userRole !== 1) ? null : (
                <StatisticsCard
                  title={title}
                  icon={React.createElement(icon, {
                    className: "w-6 h-6 text-white",
                  })}
                  footer={
                    <Typography className="font-normal text-blue-gray-600">
                      {isLoading ? (
                        <div className="loading-text">Loading...</div>
                      ) : (
                        <>
                          <strong className={footer.color}>
                            {footer.value}
                          </strong>
                          &nbsp;{footer.label}
                        </>
                      )}
                    </Typography>
                  }
                  {...(isLoading ? {} : rest)}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {(userRole === 1 || userRole === 2) && (
        <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoadingCharts ? (
            <div className="loading-text">Please wait...</div>
          ) : (
            chartsData.map((props) => (
              <StatisticsChart key={props.title} {...props} />
            ))
          )}
        </div>
      )}

      {userRole === 1 || userRole === 2 ? (
        <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
          <Card className="overflow-hidden xl:col-span-2">
            <CardHeader
              floated={false}
              shadow={false}
              color="transparent"
              className="m-0 flex items-center justify-between p-6"
            >
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-1">
                  Automation Members
                </Typography>
                <Typography
                  variant="small"
                  className="flex items-center gap-1 font-normal text-blue-gray-600"
                >
                  <CheckIcon
                    strokeWidth={3}
                    className="h-4 w-4 text-blue-500"
                  />
                  Ticket done this month
                </Typography>
              </div>
              <Menu placement="left-start">
                <MenuHandler>
                  <IconButton size="sm" variant="text" color="blue-gray">
                    <EllipsisVerticalIcon
                      strokeWidth={3}
                      fill="currenColor"
                      className="h-6 w-6"
                    />
                  </IconButton>
                </MenuHandler>
                <MenuList>
                  {/* <MenuItem>Preview</MenuItem> */}
                  <MenuItem onClick={exportToExcel}>Export</MenuItem>
                </MenuList>
              </Menu>
            </CardHeader>
            <CardBody className="overflow-x-scroll-hidden px-0 pt-0 pb-2">
              <table className="w-full min-w-[640px] table-auto">
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>&nbsp;</th>
                    <th
                      colSpan={2}
                      className="border-b-4 border-indigo-500"
                    ></th>
                  </tr>
                  <tr>
                    {[
                      "Name",
                      "Most Edited Category",
                      "Edited This Month",
                      "Last Month Comparison Ticket",
                      "Result",
                    ].map((el) => (
                      <th
                        key={el}
                        className="border-b border-blue-gray-50 py-3 px-6 text-left"
                      >
                        <Typography
                          variant="small"
                          className="text-[11px] font-medium uppercase text-blue-gray-400"
                        >
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {projectsTableData.map(
                    (
                      {
                        img,
                        name,
                        mostEdited,
                        ticketsThisMonth,
                        lastMonthPercentage,
                        result,
                      },
                      key
                    ) => {
                      const className = `py-3 px-5 ${
                        key === projectsTableData.length - 1
                          ? ""
                          : "border-b border-blue-gray-50"
                      }`;

                      return (
                        <tr key={name}>
                          <td className={className}>
                            <div className="flex items-center gap-4">
                              <Avatar src={img} alt={name} size="sm" />
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-bold"
                              >
                                {name}
                              </Typography>
                            </div>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {mostEdited}
                            </Typography>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {ticketsThisMonth}
                            </Typography>
                          </td>
                          <td className={className}>
                            <div className="w-10/12">
                              <Typography
                                variant="small"
                                className="mb-1 block text-xs font-medium text-blue-gray-600"
                              >
                                {lastMonthPercentage}%
                              </Typography>
                              <Progress
                                value={
                                  lastMonthPercentage > 1
                                    ? lastMonthPercentage
                                    : 100
                                }
                                variant="gradient"
                                color={
                                  lastMonthPercentage > 1 ? "red" : "green"
                                }
                                className="h-1"
                              />
                            </div>
                          </td>
                          <td className={className}>
                            <Typography
                              variant="small"
                              className="text-xs font-medium text-blue-gray-600"
                            >
                              {result}
                            </Typography>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </div>
      ) : (
        <>
          {userRole === 1 || userRole === 2 ? (
            <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-1">
              <Card className="overflow-hidden xl:col-span-2">
                <CardHeader
                  floated={false}
                  shadow={false}
                  color="transparent"
                  className="m-0 flex items-center justify-between p-6"
                >
                  <div>
                    <Typography variant="h6" color="blue-gray" className="mb-1">
                      Automation In-charge
                    </Typography>
                    <Typography
                      variant="small"
                      className="flex items-center gap-1 font-normal text-blue-gray-600"
                    >
                      <CheckIcon
                        strokeWidth={3}
                        className="h-4 w-4 text-blue-500"
                      />
                      Ticket edited this month
                    </Typography>
                  </div>
                </CardHeader>
                <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                  <table className="w-full min-w-[640px] table-auto">
                    <thead>
                      <tr>
                        {["Name", "Tickets", "Last Month"].map((el) => (
                          <th
                            key={el}
                            className="border-b border-blue-gray-50 py-3 px-6 text-left"
                          >
                            <Typography
                              variant="small"
                              className="text-[11px] font-medium uppercase text-blue-gray-400"
                            >
                              {el}
                            </Typography>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {projectsTableData.map(
                        ({ img, name, budget, completion }, key) => {
                          const className = `py-3 px-5 ${
                            key === projectsTableData.length - 1
                              ? ""
                              : "border-b border-blue-gray-50"
                          }`;
                          return (
                            <tr key={name}>
                              <td className={className}>
                                <div className="flex items-center gap-4">
                                  <Avatar src={img} alt={name} size="sm" />
                                  <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-bold"
                                  >
                                    {name}
                                  </Typography>
                                </div>
                              </td>
                              <td className={className}>
                                <Typography
                                  variant="small"
                                  className="text-xs font-medium text-blue-gray-600"
                                >
                                  {budget}
                                </Typography>
                              </td>
                              <td className={className}>
                                <div className="w-10/12">
                                  <Typography
                                    variant="small"
                                    className="mb-1 block text-xs font-medium text-blue-gray-600"
                                  >
                                    {completion}%
                                  </Typography>
                                  <Progress
                                    value={completion}
                                    variant="gradient"
                                    color={
                                      completion === 100 ? "green" : "blue"
                                    }
                                    className="h-1"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </CardBody>
              </Card>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default Home;
