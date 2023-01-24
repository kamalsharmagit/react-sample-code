import { useState, useEffect } from "react";
import moment from "moment";
import { connect } from "react-redux";
import { useHistory } from "react-router-dom";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  MoneyCollectOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Tag,
  Alert,
  Space,
  Table,
  Image,
  Button,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import { TablePaginationConfig } from "antd/lib/table";

import { useTranslation, Trans as Translation } from "react-i18next";

import {
  showSelectAll,
  getBackgroundColor,
  getSampleCurrencyFormat,
} from "../utils";

import DebouncedInput from "../common/DebouncedInput";
import { deleteExpense, deleteAllExpenses } from "../../api/expense";
import EditExpense from "../common/Expenses/EditExpense/EditExpense";
import ExpensesNew from "../common/Expenses/CreateExpense/CreateExpense";

import "./index.less";

function ExpensesList(props: any) {
  const {
    total,
    query,
    expenses,
    currency,
    onSearch,
    getExpenses,
    addCategory,
    customFilter,
    clearCategory,
    defaultCurrency,
    onCurrencyChange,
    selectedCategories,
  } = props;
  const [filter, setFilter] = useState({
    offset: 0,
    limit: 7,
    current: 0,
  });
  const [v, setV] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any[]>([]);
  const [isSelectAllVisible, setIsSelectAllVisible] = useState<boolean>(false);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const { t } = useTranslation("translations");

  const history = useHistory();

  const [newExpense, setNewExpense] = useState({
    visible: false,
  });

  const [billPreview, setBillPreview] = useState({});

  const handleBillPreview = (btnId: number) => {
    setBillPreview((state) => ({
      ...state,
      // @ts-ignore
      [btnId]: !state[btnId],
    }));
  };

  useEffect(() => {
    if (!isSelectAllVisible) {
      setIsAllSelected(false);
    }
  }, [isSelectAllVisible]);

  const resetNewExpense = (success = false, newCurrency = currency) => {
    setNewExpense({
      visible: false,
    });
    if (success) {
      if (newCurrency === currency) {
        getExpenses(1, query, customFilter, currency, selectedCategories);
      } else {
        onCurrencyChange(newCurrency);
      }
    }
  };

  const showNewExpense = () => {
    setNewExpense({
      visible: true,
    });
  };

  const [editExpenses, setEditExpenses] = useState({
    visible: false,
    initialValues: {},
  });

  const resetEditExpenses = (success = false, newCurrency = currency) => {
    setEditExpenses({
      visible: false,
      initialValues: {},
    });
    if (success) {
      if (newCurrency === currency) {
        getExpenses(1, query, customFilter, currency, selectedCategories);
      } else {
        onCurrencyChange(newCurrency);
      }
    }
  };

  const showEditExpenses = (record: any) => {
    setEditExpenses({
      visible: true,
      initialValues: record,
    });
  };

  const onSelectChange = (selectedKeys: any[]) => {
    setSelectedRowKeys(selectedKeys);
    setIsSelectAllVisible(
      showSelectAll(selectedKeys.length, filter.current, filter.limit, total)
    );
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onDelete = async () => {
    if (isAllSelected) {
      try {
        message.loading(`${t("Deleting selected expenses")}...`);
        await deleteAllExpenses(
          filter.current,
          query,
          selectedCategories,
          customFilter,
          currency
        );
        getExpenses(1, query, customFilter, currency, selectedCategories);
        message.success(t("Expenses deleted successfully"));
        setV(false);
        setIsAllSelected(false);
        setIsSelectAllVisible(false);
        setSelectedRowKeys([]);
      } catch (e) {
        message.error(t("Expenses deleting error!"));
        setV(false);
      }
    } else {
      const itemsPromises: any = [];
      selectedRowKeys.forEach(async (id) => {
        itemsPromises.push(deleteExpense(id));
      });
      setV(false);
      return Promise.all(itemsPromises)
        .then(() => {
          getExpenses(1, query, customFilter, currency, selectedCategories);
          message.success(t("Expenses deleted successfully"));
          setIsSelectAllVisible(false);
          setIsAllSelected(false);
          setSelectedRowKeys([]);
        })
        .catch(() => {
          message.error(t("Expenses deleting error!"));
        });
    }
  };

  const handlePagination = (pagination: TablePaginationConfig) => {
    const { pageSize, current } = pagination;

    setFilter({
      offset: filter.offset,
      // @ts-ignore
      current: current || 1,
      // @ts-ignore
      limit: 7,
    });
    getExpenses(current, query, customFilter, currency, selectedCategories);
  };

  const countOfSelectedRows = selectedRowKeys.length;

  const tablePagination = {
    size: "small" as "small",
    pageSize: filter.limit,
    current: filter.current || 1,
    total: total,
    showTotal: (total: number) => {
      const lowerLimit = expenses.length > total ? total : expenses.length;
      return (
        <strong>
          <Translation>Total</Translation>: {lowerLimit}{" "}
          <Translation>of</Translation> {total}&nbsp;&nbsp;
        </strong>
      );
    },
  };

  const columns = [
    {
      title: <Translation>Category</Translation>,
      dataIndex: "tag_type",
      key: "tag_type",
      align: "left" as "left",
      // width: "25%",
    },
    {
      title: <Translation>Expense</Translation>,
      dataIndex: "name",
      key: "name",
      width: "15%",
    },
    {
      title: <Translation>Description</Translation>,
      dataIndex: "description",
      key: "description",
      width: "20%",
    },
    // {
    //   title: "Rate",
    //   dataIndex: "rate",
    //   key: "rate",
    //   align: "right" as "right",
    //   render: (rate: any, record: any) =>
    //     getSampleCurrencyFormat(record.currency, rate),
    // },
    // {
    //   title: "Quantity",
    //   dataIndex: "quantity",
    //   key: "quantity",
    //   align: "right" as "right",
    // },
    {
      title: <Translation>Cost</Translation>,
      dataIndex: "rate",
      key: "rate",
      align: "right" as "right",
      render: (rate: any, record: any) =>
        getSampleCurrencyFormat(record.currency, rate * record.quantity),
    },
    {
      title: <Translation>Quick actions</Translation>,
      dataIndex: "",
      key: "id",
      align: "right" as "right",
      width: "250px",
      render: (id: any, record: any) => (
        <Space className="QuickActions" style={{ float: "right" }}>
          <Button
            onClick={() => {
              history.push(`/expenses/edit/${record.id}`);
            }}
            type="link"
          >
            <div>
              <EditOutlined />
            </div>
            <div>
              <Translation>Edit</Translation>
            </div>
          </Button>
          <Image
            style={{ display: "none" }}
            width={0}
            preview={{
              // @ts-ignore
              visible: billPreview[id.id],
              onVisibleChange: () => {
                handleBillPreview(id.id);
              },
            }}
            src={record.bill}
          />
          {record.bill && (
            <Button onClick={() => handleBillPreview(id.id)} type="link">
              <div>
                <EyeOutlined />
              </div>
              <div>
                <Translation>Receipt</Translation>
              </div>
            </Button>
          )}
        </Space>
      ),
    },
  ];

  /*

  function handleMenuClick(e: any) {
    switch (e.key) {
      case "1":
        showNewExpense();
        break;
      case "3":
        if (selectedRowKeys.length === 1) {
          const recordId = selectedRowKeys[0];
          const record = expenses.find((item: any) => item.id === recordId);
          if (record) {
            showEditExpenses(record);
          }
        } else if (selectedRowKeys.length === 0) {
          message.info(
            <span>
              Please select <b>a expense</b> to edit
            </span>
          );
        } else {
          message.info(
            <span>
              Please select <b>ONLY ONE</b> expense to edit
            </span>
          );
        }
    }
  }

  */

  const deleteWrapper = () => {
    const hasRows = selectedRowKeys.length > 0;
    if (hasRows) {
      setV(true);
    } else {
      message.info(
        <span>
          <Translation>
            You may <strong>select ONE/MULTIPLE </strong>expenses to delete
          </Translation>
        </span>
      );
    }
  };

  /*
  function handleCreateNewMenuClick(e: any) {
    switch (e.key) {
      case "1":
        history.push("/invoices/add");
        break;
      case "2":
        showNewClient();
        break;
      case "3":
        showNewItem();
        break;
    }
  }

  const createNewMenu = (
    <Menu onClick={handleCreateNewMenuClick}>
      <Menu.Item key="3">Create New Product</Menu.Item>
      <Menu.Item key="1">Create New Invoice</Menu.Item>
      <Menu.Item key="2">Create New Client</Menu.Item>
    </Menu>
  );
  */
  const selectedRowKeysLength = selectedRowKeys?.length;
  return (
    <div className="ClientsListTab">
      <Row gutter={[32, 16]}>
        <Col span={24}></Col>
        <Col span={12} style={{ textAlign: "left" }}>
          <DebouncedInput
            placeholder={t("Search for your expense")}
            loading={expenses.isLoading}
            onDebouncedValChange={onSearch}
            delay={300}
          />
        </Col>
        <Col span={12} style={{ textAlign: "right" }}>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title={
                selectedRowKeys.length === 1
                  ? `${t("Are you sure you want to delete this expense?")}`
                  : `${t("Are you sure you want to delete these")} ${
                      isAllSelected ? total : selectedRowKeys.length
                    } ${t("expenses")}?`
              }
              onConfirm={onDelete}
              okText={<Translation>Yes</Translation>}
              visible={v}
              trigger="click"
              cancelText={<Translation>No</Translation>}
              onCancel={() => setV(false)}
              icon={null}
            >
              <Tooltip title={t("Delete Expenses")}>
                <Button
                  onClick={deleteWrapper}
                  danger
                  size="large"
                  style={{ marginRight: 16 }}
                >
                  <strong>
                    {" "}
                    <Translation>Delete</Translation>
                  </strong>
                </Button>
              </Tooltip>
            </Popconfirm>
          )}
          <Button
            size="large"
            type="primary"
            onClick={
              // showNewExpense
              () => history.push("/expenses/add")
            }
          >
            <Translation>Add expense</Translation>
          </Button>
        </Col>
        {newExpense.visible && (
          <ExpensesNew
            visible={newExpense.visible}
            defaultCurrency={defaultCurrency}
            onCancel={resetNewExpense}
          />
        )}
        {editExpenses.visible && (
          <EditExpense
            initialValues={editExpenses.initialValues}
            visible={editExpenses.visible}
            onCancel={resetEditExpenses}
          />
        )}
        {isSelectAllVisible && false && (
          <Alert
            closable
            type="info"
            style={{
              position: "absolute",
              // top: -42,
              width: "calc(100% - 64px)",
            }}
            message={
              <div className="">
                {isAllSelected && (
                  <span className="All-SelectAllWrapper__Text">
                    {total} <Translation>expenses are selected</Translation>.
                    <Button
                      type="text"
                      className="All-SelectAllWrapper__Button"
                      onClick={() => {
                        // setSelectedRowKeys([]);
                        // setIsAllSelected(false);
                        setIsAllSelected(false);
                        setIsSelectAllVisible(false);
                        setSelectedRowKeys([]);
                      }}
                    >
                      <Translation>Clear Selection</Translation>
                    </Button>
                  </span>
                )}
                {!isAllSelected && (
                  <span className="All-SelectAllWrapper__Text">
                    {selectedRowKeys.length > 1 ? (
                      <>
                        <Translation>
                          All {{ selectedRowKeysLength }} expenses on this page
                          are selected
                        </Translation>
                        .
                      </>
                    ) : (
                      `1 ${t("expense on this page is selected")}.`
                    )}
                    <Button
                      type="text"
                      className="All-SelectAllWrapper__Button"
                      onClick={() => setIsAllSelected(true)}
                    >
                      <Translation>Select all</Translation> {total}{" "}
                      <Translation>expenses available</Translation>
                    </Button>
                  </span>
                )}
              </div>
            }
          ></Alert>
        )}
        {newExpense.visible && (
          <ExpensesNew
            visible={newExpense.visible}
            defaultCurrency={defaultCurrency}
            onCancel={resetNewExpense}
          />
        )}
        {editExpenses.visible && (
          <EditExpense
            initialValues={editExpenses.initialValues}
            visible={editExpenses.visible}
            onCancel={resetEditExpenses}
          />
        )}
        <Col span={24}>
          <Table
            rowKey="id"
            className="ClientsListTable"
            dataSource={expenses}
            columns={columns}
            rowSelection={rowSelection}
            onChange={handlePagination}
            pagination={tablePagination}
          />
        </Col>
      </Row>
    </div>
  );
}

const mapState = (state: any) => ({
  defaultCurrency: state.settings.userDetails.default_currency,
});

export default connect<{}, {}, {}>(mapState)(ExpensesList);
