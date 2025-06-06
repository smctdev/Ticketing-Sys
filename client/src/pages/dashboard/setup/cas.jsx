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
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import * as XLSX from "xlsx";
// import { Input } from "postcss";

export function SetupCAS() {
  const [cas, setCAS] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsData, setCardsData] = useState();
  const animatedComponents = makeAnimated();
  const [casValue, setCasValue] = useState(null);
  const [branchesValue, setBranchesValue] = useState([]);
  const [showButton, setShowButton] = useState(false);
  const [blist, setBlist] = useState([]);
  const [bInlist, setInBlist] = useState([]);
  const [data, setData] = useState([]);
  const [shouldTriggerApiCall, setShouldTriggerApiCall] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");

  const optionCAS = cas.map((item) => ({
    value: item.login_id,
    label: item.UserDetails.fname + " " + item.UserDetails.lname,
  }));

  const optionBranch = blist.map((item) => ({
    value: item.blist_id,
    label: item.b_code.toUpperCase(),
  }));

  const handleCasChange = (value) => {
    setCasValue(value);
    checkIfAllSelectsHaveValue(value, branchesValue);
  };

  const handleBranchesChange = (value) => {
    setBranchesValue(value);
    checkIfAllSelectsHaveValue(casValue, value);
  };

  const checkIfAllSelectsHaveValue = (accounting, branches) => {
    const allSelectsHaveValue = !!accounting && branches.length > 0;
    setShowButton(allSelectsHaveValue);
  };

  const handleSaveAssign = async () => {
    const result = await Swal.fire({
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
        try {
          Swal.fire({
            title: "Configuration Saved",
            html: `Assigning Branch To <strong> ${casValue.label} </strong> Updated Successfully.`,
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Done!",
          });
          await api.post("/assignedCAS", {
            casID: casValue.value,
            branchID: branchesValue.map((branch) => branch.value),
          });
          setCasValue(null);
          setBranchesValue([]);
          setShowButton(false);
        } catch (error) {
          if (error.response && error.response.status === 400) {
            Swal.fire({
              title: "Error",
              text: "The request was invalid. Branch already declared.",
              icon: "error",
              confirmButtonColor: "#d33",
              confirmButtonText: "CLOSE",
            });
          } else {
            console.error("An error occurred:", error);
            // Handle other types of errors if needed
          }
        }
      }
    });
  };

  useEffect(() => {
    const fetchCAS = async () => {
      try {
        const response = await api.get("/getAllCAS");
        setCAS(response.data.cas);
        setBlist(response.data.remainingBranches);
        setIsLoading(true);
      } catch (error) {
        console.log("Error fetching CAS:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCAS();
  }, [shouldTriggerApiCall]);

  useEffect(() => {
    const formattedData = cas.map((report, key) => [
      String(key + 1),
      report.UserDetails.fname + " " + report.UserDetails.lname,
      report.branch_code,
    ]);

    setData(formattedData);
  }, [cas]);

  const handleDeleteClick = async (casID, branchesToDel) => {
    if (branchesToDel.length > 0) {
      if (typeof branchesToDel) {
        branchesToDel = branchesToDel.split(",").map((branch) => branch.trim());
      }
      const { isConfirmed } = await Swal.fire({
        title: "Confirm Deletion",
        text: `Do you wish to delete all branches assigned from this CAS?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, I want to delete!",
        cancelButtonText: "Cancel",
      });

      if (isConfirmed) {
        try {
          await api.delete("/assignedDeleteCAS", {
            data: {
              casID: casID,
              branches: branchesToDel,
            },
          });
          setShouldTriggerApiCall(true);

          Swal.fire({
            icon: "success",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Done",
            title: "Branches deleted successfully!",
          });
          setCasValue(null);
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
    } else {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Already no branches assigned!",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "Close",
      });
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

  const sortedCAS = [...cas].sort((a, b) => {
    const nameA =
      a.UserDetails?.fname.toLowerCase() +
      " " +
      a.UserDetails?.lname.toLowerCase();
    const nameB =
      b.UserDetails?.fname.toLowerCase() +
      " " +
      a.UserDetails?.lname.toLowerCase();

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
              Assign Branches to CAS
            </Typography>
          </div>
          <hr />
          <div className=" static py-2 px-5">
            <div className="... inline-block min-w-[230px] py-2 px-2">
              <Select
                placeholder="CAS"
                options={optionCAS}
                onChange={handleCasChange}
                value={casValue}
              />
            </div>
            <div className="... inline-block min-w-[230px] py-2 px-2">
              <Select
                placeholder="Branches"
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
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
            Accounting List
          </Typography>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto pr-5">
            <thead>
              <tr>
                {["ID", "Name", "Assigned Branches", "Action"].map((el) => (
                  <th
                    key={el}
                    className={`cursor-pointer border-b border-blue-gray-50 py-3 px-5 text-left ${
                      el === "ID" ||
                      el === "Action" ||
                      el === "Assigned Branches"
                        ? "cursor-default"
                        : "hover:bg-gray-200"
                    }`}
                    onClick={
                      el !== "ID" &&
                      el !== "Action" &&
                      el !== "Assigned Branches"
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
              {isSearching && (
                <tr>
                  <td
                    colSpan="8"
                    className="border-b border-blue-gray-50 py-3 px-5"
                  >
                    <Typography className="text-xs font-normal text-blue-gray-500">
                      <center>
                        <b>
                          <i>Your search results will appear here...</i>
                        </b>
                      </center>
                    </Typography>
                  </td>
                </tr>
              )}
              {isLoading ? (
                <tr className="loading">
                  <td
                    colSpan="8"
                    className="loading border-b border-blue-gray-50 py-3 px-5"
                  >
                    &nbsp;
                  </td>
                </tr>
              ) : sortedCAS.length === 0 ? (
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
                sortedCAS.map((item, index) => {
                  const className = `py-3 px-5 ${
                    index === sortedCAS.length - 1
                      ? ""
                      : "border-b border-blue-gray-50"
                  }`;
                  const matchedBranches = bInlist.filter(
                    (branch) => branch.login_id === item.login_id
                  );

                  const branches = matchedBranches
                    .map((branch) => branch.Branch.b_code)
                    .join(", ");
                  const branchesToDel = matchedBranches
                    .map((branch) => branch.Branch.blist_id)
                    .join(", ");
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
                          {item.AssignedBranches &&
                          item.AssignedBranches.length > 0 ? (
                            item.AssignedBranches.map((branch, i) => (
                              <span
                                key={i}
                                className="rounded-md bg-blue-500 px-2 py-1 text-white"
                              >
                                {branch.branch.b_code.toUpperCase()}
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
                          <button
                            className="hover:nounderline transform-gpu p-1 text-black transition-transform hover:scale-150"
                            onClick={() =>
                              handleDeleteClick(item.login_id, branchesToDel)
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

export default SetupCAS;
