import { api } from "@/api/axios";
import { useEffect, useState } from "react";

export default function WowNina() {
  const [formInputs, setFormInputs] = useState([
    {
      name: "",
      email: "",
      age: 0,
    },
  ]);
  const [isLoading, setIsLoading] = useState({
    add: false,
    delete: false,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [branchList, setBranchList] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isRefresh, setIsRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/getAllBranches");
        setBranchList(response.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [isRefresh]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading({
      add: true,
    });
    setIsRefresh(true);
    try {
      const formData = new FormData();

      formInputs.map((input) => {
        formData.append("name[]", input.name);
        formData.append("email[]", input.email);
        formData.append("age[]", input.age);
      });

      const response = await api.post("/test-data", formData);
      setFormInputs([
        {
          name: "",
          email: "",
          age: 0,
        },
      ]);
    } catch {
    } finally {
      setIsLoading({
        add: false,
      });
      setIsRefresh(false);
      setSuccessMessage("Successfull submitted!");
    }
  };

  const handleChange = (index, title) => (event) => {
    const { value } = event.target;

    setFormInputs((prev) => {
      const newInputs = [...prev];

      newInputs[index][title] = value;

      return newInputs;
    });
  };

  const handleAddField = () => {
    setFormInputs((prev) => [
      ...prev,
      {
        name: "",
        email: "",
        age: 0,
      },
    ]);
  };

  const handleRemove = (index) => () => {
    setFormInputs((prev) => {
      const newFormInputs = [...prev];

      newFormInputs.splice(index, 1);

      return newFormInputs;
    });
  };

  const handleCheckboxChange = (id) => () => {
    setSelectedIds((prev) => {
      const newStates = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      return newStates;
    });
  };

  const handleDeleteSelected = async () => {
    setIsRefresh(true);
    setIsLoading({
      delete: true,
    });
    try {
      const response = await api.delete("/delete-blist", {
        data: {
          ids: selectedIds,
        },
      });
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefresh(false);
      setIsLoading({
        delete: false,
      });
    }
  };

  const handleSelectAll = () => {
    setSelectedIds(
      selectedIds.length === branchList.length
        ? []
        : branchList.map((branch) => branch.blist_id)
    );
  };

  return (
    <>
      <div className="flex h-screen flex-col items-center justify-center">
        {successMessage && (
          <span className="mb-3 rounded bg-green-600 p-3 text-green-100">
            {successMessage}
          </span>
        )}
        <form onSubmit={handleSubmit} className="max-h-96 overflow-y-auto">
          <div className="flex flex-col">
            <div>
              <button
                type="button"
                className="float-right rounded bg-blue-500 p-2 transition-all duration-300 ease-in-out hover:bg-blue-600"
                onClick={handleAddField}
              >
                Add Field
              </button>
            </div>
            <div>
              {formInputs.map((formInput, index) => (
                <div key={index} className="flex items-center gap-1">
                  <div className="space-x-2 space-y-1">
                    <input
                      type="text"
                      name="name"
                      value={formInput.name}
                      onChange={handleChange(index, "name")}
                      className="rounded border border-gray-300 p-2 transition-all duration-300 ease-in-out"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formInput.email}
                      onChange={handleChange(index, "email")}
                      className="rounded border border-gray-300 p-2 transition-all duration-300 ease-in-out"
                    />
                    <input
                      type="number"
                      name="age"
                      value={formInput.age}
                      min={1}
                      max={9}
                      onChange={handleChange(index, "age")}
                      className="rounded border border-gray-300 p-2 transition-all duration-300 ease-in-out"
                    />
                  </div>
                  {formInputs.length > 1 && index !== 0 && (
                    <div>
                      <button
                        className="rounded bg-red-500 p-2 transition-all duration-300 ease-in-out hover:bg-red-600"
                        type="button"
                        onClick={handleRemove(index)}
                      >
                        X
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mx-auto">
              <button
                type="submit"
                disabled={isLoading.add}
                className="mt-2 rounded bg-blue-500 p-2 transition-all duration-300 ease-in-out hover:bg-blue-600"
              >
                {isLoading.add ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </div>
      {selectedIds.length > 0 && (
        <button
          className="rounded bg-red-500 p-2"
          type="button"
          onClick={handleDeleteSelected}
        >
          {isLoading.delete
            ? "Deleting..."
            : `Delete Selected (${selectedIds.length})`}
        </button>
      )}
      <table className="w-full table-auto">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedIds.length === branchList.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>ID.</th>
            <th>Branch Code</th>
            <th>Branch Name</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {isLoadingData ? (
            <tr>
              <td colSpan={5}>
                <p className="text-center">Loading...</p>
              </td>
            </tr>
          ) : branchList.length < 0 ? (
            <tr>
              <td colSpan={5}>
                <p className="text-center">No data found</p>
              </td>
            </tr>
          ) : (
            branchList.map((branch, index) => (
              <tr key={index}>
                <td className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(branch.blist_id)}
                    onChange={handleCheckboxChange(branch.blist_id)}
                  />
                </td>
                <td className="text-center">{branch.blist_id}</td>
                <td className="text-center">{branch.b_code}</td>
                <td className="text-center">{branch.b_name}</td>
                <td className="text-center">{branch.category}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
}
