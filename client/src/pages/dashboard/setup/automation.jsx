import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  IconButton,
  MenuItem,
  Input,
} from "@material-tailwind/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { api } from "@/api/axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import * as XLSX from "xlsx";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
// import { Input } from "postcss";

export function SetupAutomation() {
  const [automation, setAutomation] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsData, setCardsData] = useState();
  const animatedComponents = makeAnimated();
  const [automationValue, setAutomationValue] = useState(null);
  const [branchesValue, setBranchesValue] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [blist, setBlist] = useState([]);
  const [reports, setReports] = useState([]);
  const [data, setData] = useState([]);
  // const [searchValue, setSearchValue] = useState('');
  // const [page, setPage] = useState(1);
  // const [limit, setLimit] = useState(5);
  // const [totalRecords, setTotalRecords] = useState(0);
  const [shouldTriggerApiCall, setShouldTriggerApiCall] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const updateCategories = (newCategory) => {
    setCategories(newCategory);
  };

  const optionAutomation = automation.map((item) => ({
    value: item.UserDetails.fname,
    label: item.UserDetails.fname + " " + item.UserDetails.lname,
  }));

  const optionBranch = blist.map((item) => ({
    value: item.b_code,
    label: item.b_code.toUpperCase(),
  }));

  const handleAutomationChange = (value) => {
    setAutomationValue(value);
    checkIfAllSelectsHaveValue(value, branchesValue);
  };

  const handleBranchesChange = (value) => {
    setBranchesValue(value);
    checkIfAllSelectsHaveValue(automationValue, value);
  };

  const checkIfAllSelectsHaveValue = (automation, branches) => {
    const allSelectsHaveValue = !!automation && branches.length > 0;
    setShowButton(allSelectsHaveValue);
  };

  const handleSaveAssign = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setShouldTriggerApiCall(true);
        Swal.fire({
          title: "Configuration Saved",
          html: `Assigning Branch To <strong> Automation ${automationValue.value} </strong> Updated Successfully.`,
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Done!",
        });
        await api.put("/assignedToUpdate", {
          automationName: automationValue.value, // Replace with your actual value
          branches: branchesValue.map((branch) => branch.value), // Replace with your actual value
        });
        setAutomationValue(null);
        setBranchesValue([]);
        setShowButton(false);
      }
    });
  };

  useEffect(() => {
    const fetchAutomation = async () => {
      try {
        const response = await api.get("/getAllAutomation");
        setAutomation(response.data.automations);
        setBlist(response.data.remainingBranches);
        setIsLoading(true);
      } catch (error) {
        console.log("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAutomation();
  }, [shouldTriggerApiCall]);

  //Add Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  //View Category
  const [isViewCategoryOpen, setIsViewCategoryOpen] = useState(false);
  const [showCategoryIdToView, setShowCategoryIdToView] = useState(null);

  const handleViewCategoryClick = (categoryID) => {
    setIsViewCategoryOpen(true);
    setShowCategoryIdToView(categoryID);
  };
  const closeViewModal = () => {
    setIsViewCategoryOpen(false);
  };

  // Update the data state with the table data when reports change
  useEffect(() => {
    // Convert your reports data into the desired structure
    const formattedData = automation.map((report, key) => [
      String(key + 1),
      report.UserDetails.fname + " " + report.UserDetails.lname,
      report.branch_code,
      // "View", // You can customize this column as needed
    ]);

    // Set the formatted data in the data state
    setData(formattedData);
  }, [automation]);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([["ID", "Name", "Branches"], ...data]); // Add header row
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "exported_data_automation.xlsx");
  };

  //Edit Category
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [showCategoryIdToEdit, setShowCategoryIdToEdit] = useState(null);

  const handleEditCategoryClick = (categoryID) => {
    setIsEditCategoryOpen(true);
    setShowCategoryIdToEdit(categoryID);
  };

  const closeEditModal = () => {
    setIsEditCategoryOpen(false);
  };

  const handleDeleteClick = async (automationName, branches) => {
    if (typeof branches === "string") {
      // Split the comma-separated string into an array
      branches = branches.split(",").map((branch) => branch.trim());
    }
    const { isConfirmed } = await Swal.fire({
      title: "Confirm Deletion",
      text: `Do you wish to delete all branches assigned from this automation?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, I want to delete!",
      cancelButtonText: "Cancel",
    });

    if (isConfirmed) {
      try {
        await api.delete("/assignedToDelete", {
          data: {
            // Use the "data" property to send the request body
            automationName: automationName,
            branches: branches,
          },
        });
        setShouldTriggerApiCall(true);

        Swal.fire({
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Done",
          title: "Branches deleted successfully!",
        });
        setAutomationValue(null);
        setBranchesValue([]);
        setShowButton(false);
      } catch (error) {
        // Handle errors if the request fails
        console.error("Error deleting branches:", error);

        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "An error occurred while deleting the branches.",
        });
      }
    }
  };

  const handleSearch = async () => {
    try {
      const response = await api.get("/getAllBranches");
      const branches = response.data.data; // Access the response data using response.data
      const branchCodes = branches.map((branch) => branch.Branch.b_code);
      setIsSearching(true);
    } catch (error) {
      console.error("Error fetching branch data:", error);
      alert("Error Please Contact Web Development Team");
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const sortedAutomation = [...automation].sort((a, b) => {
    const nameA =
      a.UserDetails?.fname.toLowerCase() +
      " " +
      a.UserDetails?.lname.toLowerCase();
    const nameB =
      b.UserDetails?.fname.toLowerCase() +
      " " +
      b.UserDetails?.lname.toLowerCase();

    if (sortBy !== null) {
      if (sortBy.toLowerCase() === "name") {
        if (sortDirection === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      }
    }
  });

  return (
    <div className="mt-12 flex flex-col gap-12">
      <Card className="-mt-7">
        <CardBody className="px-0 pt-0 pb-2">
          <div>
            <Typography variant="h6" color="gray" className="ml-4 pb-2 pt-2">
              Assign Branches to Automation
            </Typography>
          </div>
          <hr />
          <div className=" static py-2 px-5">
            <div className="... inline-block min-w-[230px] py-2 px-2">
              <Select
                placeholder="Automation"
                options={optionAutomation}
                onChange={handleAutomationChange}
                value={automationValue}
              />
            </div>
            <div className="... inline-block min-w-[230px] py-2 px-2">
              <Select
                placeholder="Branches"
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                defaultValue={[{ value: "option1", label: "Option 1" }]}
                options={optionBranch}
                onChange={handleBranchesChange}
                value={branchesValue}
              />
            </div>
            <div className="... inline-block py-2 px-2">
              {showButton && (
                <button onClick={handleSaveAssign}>
                  <CheckCircleIcon className="checkCustom absolute -mt-[23px] h-9 w-9 text-blue-500" />
                </button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
      <Card className="-mt-7"></Card>
      <Card>
        <CardHeader variant="gradient" color="blue" className="mb-8 p-3">
          <Typography variant="h6" color="white">
            Automation List
          </Typography>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* <div className=" py-2 px-5 static">
          <Typography variant="h6" color="gray" className="ml-2">
            Filter
          </Typography>
        
            <div className="inline-block ... py-2 px-2 min-w-[230px]">
            <Input 
                label = "Search Branch Code"
                className=""
                onChange={handleSearch}
                />
                </div>
            </div> */}
          {/* <Menu placement="left-right">
              <MenuHandler  className = "float-right -mt-[45px] mr-[25px]">
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon
                    strokeWidth={3}
                    fill="currenColor"
                    className="h-6 w-6"
                  />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem onClick={exportToExcel}>Export</MenuItem>
              </MenuList>
            </Menu> */}
          <table className="w-full min-w-[640px] table-auto pr-5">
            <thead>
              <tr>
                {["ID", "Name", "Branches", "Action"].map((el) => (
                  <th
                    key={el}
                    className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                      el === "ID" || el === "Action" || el === "Branches"
                        ? "cursor-default"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={
                      el !== "ID" && el !== "Action" && el !== "Branches"
                        ? () => handleSort(el)
                        : undefined
                    }
                  >
                    <div className="flex items-center">
                      <Typography
                        variant="small"
                        className="text-[11px] font-bold uppercase"
                      >
                        {el}
                      </Typography>
                      {sortBy === el &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-1 h-4 w-4" />
                        ))}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* {isSearching && (
                <tr>
                  <td colSpan="8" className="py-3 px-5 border-b border-blue-gray-50">
                    <Typography className="text-xs font-normal text-blue-gray-500">
                      <center><b><i>Your search results will appear here...</i></b></center>
                    </Typography>
                  </td>
                </tr>
              )} */}
              {isLoading ? (
                <tr className="loading">
                  <td
                    colSpan="8"
                    className="loading border-b border-blue-gray-50 py-3 px-5"
                  >
                    &nbsp;
                  </td>
                </tr>
              ) : sortedAutomation.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="border-b border-blue-gray-50 py-3 px-5"
                  >
                    <Typography className="text-xs font-normal text-blue-gray-500">
                      <center>
                        <b>
                          <i>No record found! .....</i>
                        </b>
                      </center>
                    </Typography>
                  </td>
                </tr>
              ) : (
                sortedAutomation.map((item, index) => {
                  const className = `py-3 px-5 ${
                    index === sortedAutomation.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;
                  return (
                    <tr className="addbghover">
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <div>
                            <Typography className="text-xs font-normal text-blue-gray-500">
                              {index + 1}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-500">
                          {item.UserDetails.fname +
                            " " +
                            item.UserDetails.lname}
                        </Typography>
                      </td>
                      <td className={`${className} max-w-[300px]`}>
                        <Typography className="flex flex-wrap gap-1 text-xs font-normal">
                          {item.AssignedBranches.length > 0 ? (
                            item.AssignedBranches.map((branch, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-blue-500 px-2 py-1 text-white"
                              >
                                {branch.toUpperCase()}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-md bg-gray-500 px-2 py-1 text-white">
                              No branches assigned yet
                            </span>
                          )}
                        </Typography>
                      </td>

                      <td className={className}>
                        <div className="flex items-center gap-2">
                          {/* <button
                          className="text-black hover:nounderline"
                          onClick={() => handleViewCategoryClick(item.ticket_category_id)}
                        >
                          <EyeIcon className="w-4 h-4 text-blue-500"/>
                        </button>
                        <button
                          className="text-black hover:nounderline p-1"
                          onClick={() =>handleEditCategoryClick(item.ticket_category_id)}
                        >
                          <PencilIcon className="w-4 h-4 text-green-500 p-1" />
                        </button> */}
                          <button
                            className="hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                            onClick={() =>
                              handleDeleteClick(
                                item.UserDetails.fname,
                                branches
                              )
                            }
                          >
                            <TrashIcon
                              className="h-4 w-4 text-red-500"
                              title="Delete?"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}

export default SetupAutomation;
