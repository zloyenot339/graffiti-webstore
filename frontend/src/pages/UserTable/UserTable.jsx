import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Box from "@mui/material/Box";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../services/userService";
import { useState } from "react";
import { useEffect } from "react";
import Header from "../../components/Header/Header";

const UserTable = () => {
  const navigate = useNavigate();

  const columns = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "email", headerName: "Email", width: 200 },
  ];

  const [rows, setRows] = useState([]);
  const [rowCountState, setRowCountState] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (page, pageSize) => {
    setLoading(true);
    try {
      const res = await api.get("/login", {
        params: { _page: page + 1, _limit: pageSize },
      });
      setRows(res.data.data);
      setRowCountState(res.data.totalItems);
    } catch (err) {
      console.error("Error loading users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, pageSize);
  }, [page, pageSize]);

  return (
    <>
      <Header />
      <Box sx={{ height: 500, width: "50%"}}>
        <DataGrid 
          rows={rows}
          columns={columns}
          pageSize={pageSize}
          rowCount={rowCountState}
          page={page}
          pagination
          paginationMode="server"
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setPage(0);
          }}
          loading={loading}
          getRowId={(row) => row.id}
        />
      </Box>
      <Button
        onClick={() => {
          navigate("/home");
        }}
      >
        Go home
      </Button>
    </>
  );
};

export default UserTable;
