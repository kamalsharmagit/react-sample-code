import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import Table from "components/Table/Table.js";
import TableContainer from "@material-ui/core/TableContainer";
import Pagination from "components/Pagination/Pagination.js";
import Button from "components/CustomButtons/Button.js";
import styles from "assets/jss/material-dashboard-react/views/pageStyle";
import { endpoint } from "assets/api/endpoint";
import { apiHandler } from "assets/api";
import CustomDateSelector from "components/CustomDateSelector/CustomDateSelector";
import InputAdornment from "@material-ui/core/InputAdornment";
import cx from "classnames";
import { IconButton } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import CustomerServiceModal from "views/pages/CheckerModule/ReceiptAndPayments/CustomerServiceModal/CustomerServiceModal";
import LoanMarkingDetailsModal from "./Modal/LoanMarkingDetailsModal";
import NoticeModal from "views/components/NoticeModal";
import { parseDate } from "utils/Utils";
import axios from "axios";
import ClearAllIcon from "@material-ui/icons/ClearAll"; // clear result
import ClearIcon from "@material-ui/icons/Clear"; //clear
import ThumbUpIcon from "@material-ui/icons/ThumbUp"; // authorize
import ThumbDownIcon from "@material-ui/icons/ThumbDown"; // reject
import { SearchTable } from "utils/Utils";
import SearchInput from "components/CustomInput/SearchInput";
import LoanMarkingViewModal from "views/components/MakerModule/LoanMarking/LoanMarking/LoanMarkingview/LoanMarkingViewModal";
import CircularProgresss from "components/CircularProgress/CircularProgresss";
import ConfirmationModal from "views/components/ConfirmationModal";
const useStyles = makeStyles(styles);

const LoanMarking = () => {
  const classes = useStyles();
  const params = useParams();
  let navigate = useNavigate();

  const dispatch = useDispatch();
  const [rawData, setRawData] = useState({});

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [TransactionDate, setTransactionDate] = useState(null);
  const [loanAccount, setLoanAccount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [customerName, setcustomerName] = useState("");
  const [transactionBranch, setTransactionBranch] = useState("");
  const [transactionRefObj, setTransactionRefObj] = useState({});
  const [showLoanMarkingView, setShowLoanMarkingView] = useState(false);
  const [maker, setMaker] = useState("");
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [CustomerService, setCustomerService] = useState({});
  const [showdeleteWaiveOff, setShowdeleteWaiveOff] = useState(false);
  const [deleteWaiveOff, setdeleteWaiveOff] = useState({});
  const [selectedTableData, setSelectedTableData] = useState([]);
  const [selected, setSelected] = React.useState([]);
  const [tableData, setTableData] = useState([]);
  const [tableColumns, setTableColumns] = useState([
    "Transaction Reference Number",
    "Customer ID",
    " Loan Account Number",
    "Overdue",
    "Action Flag",
    "Reason",
    "Remarks",
  ]);
  const [selectedPageIndex, setSelectedPageIndex] = useState(1);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [noticeModal, setNoticeModal] = useState(false);
  const [noticeModalErrMsg, setNoticeModalErrMsg] = useState("");
  const [noticeModalHeaderMsg, setNoticeModalHeaderMsg] = useState("");
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [confirmationModalHeader, setConfirmationModalHeader] = useState("");
  const [confirmationModalMsg, setConfirmationModalMsg] = useState("");
  const [role, setRole] = useState("");
  const [callInProgress, setCallInProgress] = useState(false);
  const { authToken } = useSelector((state) => state.login.authData);
  const [status, setStatus] = useState("");
  const closeNoticeModal = () => {
    setNoticeModal(false);
    setNoticeModalErrMsg("");
    setNoticeModalHeaderMsg("");
  };
  const handleTransactionDateChange = (date) => {
    setTransactionDate(date);
  };
  useEffect(() => {
    getUserDetails();
  }, []);
  const getUserDetails = async () => {
    const result = await apiHandler({
      url: endpoint.USER_DETAIL,
      authToken: authToken,
    });

    setRole(result.data.role);
  };
  const onUpdateStatus = (status) => {
    if (role === "maker" || role === "checker") {
      setNoticeModalHeaderMsg("Error");
      setNoticeModalErrMsg("Not Authorised");
      setNoticeModal(true);
      return false;
    }
    setCallInProgress(true);
    axios
      .all(
        selected.map((d) =>
          apiHandler({
            url: endpoint.LOAN_MARKING_UPDATE,
            method: "PUT",
            authToken: authToken,
            data: {
              id: d,
              status: status,
            },
          })
        )
      )
      .then(
        axios.spread(function (...result) {
          setCallInProgress(false);
          // all requests are now complete
          let anyError = false;
          for (var i = 0; i < result.length; ++i) {
            if (result[i].data.error_code) anyError = true;
          }
          if (anyError) {
            setNoticeModalHeaderMsg("Error");
            setNoticeModalErrMsg("Error in " + status + " of Loan Marking");
            setNoticeModal(true);
          } else {
            // console.log(result.data);
            // setRawData(result.data);
            setNoticeModalHeaderMsg("Success");
            setNoticeModalErrMsg("Success in " + status + " of Loan Marking");
            setNoticeModal(true);
          }
          searchData();
        })
      );
  };
  const showstatusResponse = (event, value) => {
    event.preventDefault();
    event.stopPropagation();
    setStatus(value);
    setConfirmationModalHeader("Loan Marking");
    setConfirmationModalMsg(
      "Are you sure you want to " + value + " this entry"
    );
    setConfirmationModal(true);
  };
  const handleNegativeResponse = () => {
    setConfirmationModal(false);
    setConfirmationModalHeader("");
    setConfirmationModalMsg("");
  };
  const handlePositiveResponse = async () => {
    handleNegativeResponse();
    let value = status;
    // Call API to delete loanMarking
    onUpdateStatus(value);
  };
  const SearchParam = () => {
    let query = "";
    if (loanAccount !== "") {
      if (query !== "") query = query + "&";
      query = query + "loanAccountNumber=" + loanAccount;
    }
    if (customerId !== "") {
      if (query !== "") query = query + "&";
      query = query + "customerId=" + customerId;
    }
    if (customerName !== "") {
      if (query !== "") query = query + "&";
      query = query + "customerName=" + customerName;
    }
    if (transactionBranch !== "") {
      if (query !== "") query = query + "&";
      query = query + "branchCode=" + transactionBranch;
    }
    if (maker !== "") {
      if (query !== "") query = query + "&";
      query = query + "createdByUserName=" + maker;
    }
    if (TransactionDate !== null) {
      if (query !== "") query = query + "&";
      query = query + "markingDate=" + TransactionDate;
    }
    return query;
  };
  const ValidateSearch = () => {
    if (
      loanAccount === "" &&
      customerId === "" &&
      maker === "" &&
      customerName === "" &&
      transactionBranch === "" &&
      TransactionDate === null
    )
      return false;
    else return true;
  };
  const GetLoanMarkingData = async () => {
    const query = SearchParam();
    const result = await apiHandler({
      url:
        endpoint.LOAN_MARKING_SEARCH + "?" + query + "&taskType=LOAN_MARKING",
      authToken: authToken,
    });
    if (result.data.error_code) {
      setNoticeModalHeaderMsg("Error");
      setNoticeModalErrMsg("No records found");
      setNoticeModal(true);
    } else {
      if (result.data.length === 0) {
        setNoticeModalHeaderMsg("Error");
        setNoticeModalErrMsg("No records found");
        setNoticeModal(true);
        clearResultData();
      } else {
        console.log(result.data);
        setRawData(result.data);
        parseIndicatorData(result.data);
      }
    }
  };
  const parseIndicatorData = (data) => {
    let reportData = [];
    data &&
      data.forEach((loan) => {
        let row = [
          loan.id,
          getLink(loan.id),
          loan.customerId,
          loan.loanAccountNumber,
          loan.totalOverdue,
          loan.actionType,
          loan.reason,
          loan.remarks,
        ];
        reportData.push(row);
      });
    let selectedList = reportData.slice(
      (selectedPageIndex - 1) * rowsPerPage,
      selectedPageIndex * rowsPerPage
    );
    setSelectedTableData(selectedList);
    setTableData(reportData);
  };

  const onSearchChange = (event) => {
    const filteredData = SearchTable(
      rawData,
      ["id", "customerId", "actionType", "Reason"],
      event.target.value
    );
    parseIndicatorData(filteredData);
  };
  const getPageData = (event) => {
    let pageIndex = 0;
    let pageCount = Math.ceil(tableData.length / rowsPerPage);
    switch (event.target.innerText) {
      case "FIRST":
        pageIndex = 1;
        break;
      case "PREVIOUS":
        pageIndex = selectedPageIndex - 1;
        break;
      case "LAST":
        pageIndex = pageCount;
        break;
      case "NEXT":
        pageIndex = selectedPageIndex + 1;
        break;
      default:
        pageIndex = parseInt(event.target.innerText);
        break;
    }
    if (pageIndex < 1) pageIndex = 1;
    else if (pageIndex > pageCount) pageIndex = pageCount;

    let selectedList = tableData.slice(
      (pageIndex - 1) * rowsPerPage,
      pageIndex * rowsPerPage
    );
    setSelectedPageIndex(pageIndex);
    setSelectedTableData(selectedList);
  };
  const getPageDetails = () => {
    let DataCount = Math.ceil(tableData.length / rowsPerPage);
    // switch ()
    let pageArray = [];
    Array.from(new Array(DataCount)).forEach((count, index) => {
      if (index + 1 === selectedPageIndex) {
        pageArray.push({
          text: `${index + 1}`,
          active: true,
        });
      } else {
        pageArray.push({
          text: `${index + 1}`,
        });
      }
    });
    return pageArray;
  };
  const getLink = (id) => {
    return (
      <a
        style={{ cursor: "pointer" }}
        //
        onClick={() => ontransactionnumber(id)}
      >
        {id}
      </a>
    );
  };
  const closeCustomerService = () => {
    setShowCustomerService(false);
    setCustomerService({});
  };
  const onCustomerService = () => {
    setShowCustomerService(true);
  };
  const CloseLoanMarkingView = () => {
    setShowLoanMarkingView(false);
    setTransactionRefObj({});
  };
  const ontransactionnumber = async (id) => {
    const result = await apiHandler({
      url: endpoint.LOAN_MARKING_BYID + id,
      authToken: authToken,
    });
    const resultloanAccount = await apiHandler({
      url:
        endpoint.CUSTOMER_SERVICE_SEARCH +
        "?loanAccountNumber=" +
        result.data.loanAccountNumber,
      method: "GET",
      authToken: authToken,
    });

    const data = {
      ...result.data,
      CustomerName: resultloanAccount.data[0].customerName,
      //CustomerId:resultloanAccount.data[0].customerId,
    };
    setTransactionRefObj(data);
    setShowLoanMarkingView(true);
  };
  const clearResultData = () => {
    setSelectedTableData([]);
    setSelected([]);

    setShowSearchBox(false);
  };
  const clearData = () => {
    setTransactionDate(null);
    setLoanAccount("");
    setcustomerName("");

    setTransactionBranch("");
    setMaker("");
    setCustomerId("");
  };
  const searchData = () => {
    if (ValidateSearch()) {
      GetLoanMarkingData();
      setSelected([]);
      setShowSearchBox(true);
    } else {
      setNoticeModalHeaderMsg("Error");
      setNoticeModalErrMsg("Please Provide Valid Search data");
      setNoticeModal(true);
    }
  };
  const handleSelectAllClick = (event) => {
    // if (event.target.checked) {
    //   const newSelecteds = rawData.map((n) => n.id);
    //   setSelected(newSelecteds);
    //   return;
    // }
    setSelected([]);
  };
  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [id];
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = [id];
    }

    setSelected(newSelected);
  };
  return (
    <div>
      <GridContainer justfly="center">
        <GridItem xs={12} sm={12} md={12} lg={12}>
          <GridContainer>
            <GridItem
              xs={6}
              sm={6}
              md={6}
              lg={6}
              style={{ textAlign: "start" }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.825em",
                  lineHeight: "1.5em",
                }}
              >
                Loan Marking(Author)
              </div>
            </GridItem>
            <GridItem xs={6} sm={6} md={6} lg={6}></GridItem>
          </GridContainer>
          <GridContainer style={{ margin: 10, border: "2px solid #cccccc" }}>
            <GridItem xs={5} sm={5} md={5} lg={5}>
              <CustomInput
                labelText="Loan Account Number"
                id="Loan_account"
                formControlProps={{
                  fullWidth: true,
                }}
                inputProps={{
                  value: loanAccount,
                  onChange: (e) => setLoanAccount(e.target.value),
                  endAdornment: (
                    <InputAdornment
                      position="start"
                      onClick={() => onCustomerService()}
                    >
                      <IconButton className={classes.inputAdornmentIcon}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </GridItem>
            <GridItem xs={1} sm={1} md={1} lg={1}></GridItem>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <CustomInput
                labelText="Customer ID"
                id="customer_id"
                formControlProps={{
                  fullWidth: true,
                }}
                inputProps={{
                  value: customerId,
                  onChange: (e) => setCustomerId(e.target.value),
                }}
              />
            </GridItem>
            <GridItem xs={2} sm={2} md={2} lg={2}></GridItem>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <CustomInput
                labelText="Customer Name"
                id="customer_name"
                formControlProps={{
                  fullWidth: true,
                }}
                inputProps={{
                  value: customerName,
                  onChange: (e) => setcustomerName(e.target.value),
                }}
              />
            </GridItem>
            <GridItem xs={2} sm={2} md={2} lg={2}></GridItem>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <CustomInput
                labelText="Transaction Branch"
                id="Branch"
                formControlProps={{
                  fullWidth: true,
                }}
                inputProps={{
                  value: transactionBranch,
                  onChange: (e) => setTransactionBranch(e.target.value),
                }}
              />
            </GridItem>
            <GridItem xs={2} sm={2} md={2} lg={2}></GridItem>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <CustomInput
                labelText="Maker"
                id="Maker"
                formControlProps={{
                  fullWidth: true,
                }}
                inputProps={{
                  value: maker,
                  onChange: (e) => setMaker(e.target.value),
                }}
              />
            </GridItem>
            <GridItem xs={2} sm={2} md={2} lg={2}></GridItem>
            <GridItem xs={4} sm={4} md={4} lg={4}>
              <CustomDateSelector
                id="From_Date"
                inputProps={{
                  format: "dd MMM yyyy",
                  label: "Transaction From date",
                  value: TransactionDate,
                  onChange: handleTransactionDateChange,
                  keyboardbuttonprops: {
                    "aria-label": "change date",
                  },
                }}
                formControlProps={{
                  fullWidth: true,
                  className: cx(
                    classes.customDateControlClasses,
                    classes.customFormControlClasses
                  ),
                }}
              />
            </GridItem>
            <GridItem xs={2} sm={2} md={2} lg={2}></GridItem>

            <GridItem
              xs={6}
              sm={6}
              md={6}
              lg={6}
              style={{ textAlign: "start" }}
            >
              <Button round={false} color="info" onClick={() => searchData()}>
                <span>
                  <SearchIcon />{" "}
                </span>
                <span> Search </span>
              </Button>
              <Button round={false} color="gray" onClick={() => clearData()}>
                <span>
                  <ClearIcon />{" "}
                </span>
                <span> Clear</span>
              </Button>
              <Button
                round={false}
                color="gray"
                onClick={() => clearResultData()}
              >
                <span>
                  <ClearAllIcon />{" "}
                </span>
                <span> Clear Result</span>
              </Button>
            </GridItem>
          </GridContainer>
          {showSearchBox && (
            <GridContainer>
              <GridItem xs={12} sm={12} md={12} lg={12}>
                <GridContainer>
                  <GridItem
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    style={{ textAlign: "end" }}
                  >
                    <Button
                      round={false}
                      color="info"
                      disabled={selected.length < 1 || callInProgress}
                      onClick={(event) => showstatusResponse(event, "REALIZED")}
                    >
                      <span>
                        <ThumbUpIcon />{" "}
                      </span>
                      <span> Authorize </span>
                    </Button>
                    <Button
                      round={false}
                      color="info"
                      disabled={selected.length < 1 || callInProgress}
                      onClick={(event) => showstatusResponse(event, "REJECTED")}
                    >
                      <span>
                        <ThumbDownIcon />
                      </span>
                      <span> Reject </span>
                    </Button>
                  </GridItem>
                </GridContainer>
                <TableContainer
                  style={{
                    margin: 10,
                    border: "2px solid #cccccc",
                  }}
                >
                  <GridContainer>
                    <GridItem
                      xs={4}
                      sm={4}
                      md={4}
                      lg={4}
                      style={{ textAlign: "start" }}
                    >
                      <SearchInput
                        inputProps={{
                          onchange: onSearchChange,
                        }}
                        labelText="Search"
                        id="Search"
                        formControlProps={{}}
                      />
                    </GridItem>
                  </GridContainer>
                  <Table
                    tableHeaderColor="warning"
                    tableHead={tableColumns}
                    tableData={selectedTableData}
                    checkboxSelection={true}
                    handleSelectAllClick={handleSelectAllClick}
                    handleClick={handleClick}
                    selected={selected}
                  />
                  {selectedTableData.length > 0 ? (
                    <div style={{ textAlign: "right" }}>
                      <Pagination
                        pages={getPageDetails()}
                        currentPage={selectedPageIndex}
                        color="info"
                        onClick={(event) => getPageData(event)}
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontWeight: "bolder" }}>No Records Found</p>
                    </div>
                  )}
                </TableContainer>
              </GridItem>
            </GridContainer>
          )}
        </GridItem>
        {showCustomerService && (
          <CustomerServiceModal
            showModal={showCustomerService}
            // trade={CustomerService}
            loanAccountNumber={loanAccount}
            closeModal={closeCustomerService}
          />
        )}
        {showLoanMarkingView && (
          <LoanMarkingViewModal
            showModal={showLoanMarkingView}
            // trade={WaiveOff}
            transactionRefObj={transactionRefObj}
            closeModal={CloseLoanMarkingView}
          />
        )}
        {showdeleteWaiveOff && (
          <LoanMarkingDetailsModal
            showModal={showdeleteWaiveOff}
            trade={deleteWaiveOff}
            closeModal={ClosedeleteWaiveOff}
          />
        )}
        {noticeModal && (
          <NoticeModal
            noticeModal={noticeModal}
            noticeModalHeader={noticeModalHeaderMsg}
            noticeModalErrMsg={noticeModalErrMsg}
            closeModal={closeNoticeModal}
          />
        )}
        {callInProgress && (
          <CircularProgresss callInProgress={callInProgress} />
        )}
        {confirmationModal && (
          <ConfirmationModal
            confirmationModal={confirmationModal}
            confirmationModalHeader={confirmationModalHeader}
            confirmationModalMsg={confirmationModalMsg}
            handleNegativeButton={handleNegativeResponse}
            handlePositiveButton={handlePositiveResponse}
          />
        )}
      </GridContainer>
    </div>
  );
};

LoanMarking.propTypes = {
  classes: PropTypes.object,
};

export default LoanMarking;
