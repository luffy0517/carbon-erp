import {
  Button,
  Grid,
  Heading,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { Select, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import type { AccountListItem } from "~/modules/accounting";
import { defaultAcountValidator } from "~/modules/accounting";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type AccountDefaultsFormProps = {
  balanceSheetAccounts: AccountListItem[];
  incomeStatementAccounts: AccountListItem[];
  initialValues: TypeOfValidator<typeof defaultAcountValidator>;
};

const AccountDefaultsForm = ({
  balanceSheetAccounts,
  incomeStatementAccounts,
  initialValues,
}: AccountDefaultsFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const isDisabled = !permissions.can("update", "accounting");

  const incomeStatementAccountOptions = incomeStatementAccounts.map((c) => ({
    value: c.number,
    label: `${c.number} - ${c.name}`,
  }));

  const balanceSheetAccountOptions = balanceSheetAccounts.map((c) => ({
    value: c.number,
    label: `${c.number} - ${c.name}`,
  }));

  return (
    <VStack w="full" h="full" spacing={0}>
      <ValidatedForm
        validator={defaultAcountValidator}
        method="post"
        action={path.to.accountingDefaults}
        defaultValues={initialValues}
        style={{
          width: "100%",
        }}
      >
        <Tabs colorScheme="gray">
          <TabList>
            <Tab>Income Statement</Tab>
            <Tab>Balance Sheet</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <VStack w="full" alignItems="start" spacing={8}>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Revenue
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="salesAccount"
                      label="Sales"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="salesDiscountAccount"
                      label="Sales Discounts"
                      options={incomeStatementAccountOptions}
                    />
                  </Grid>
                </VStack>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Expenses
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="costOfGoodsSoldAccount"
                      label="Cost of Goods Sold"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="purchaseAccount"
                      label="Purchases"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="directCostAppliedAccount"
                      label="Direct Cost Applied"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="overheadCostAppliedAccount"
                      label="Overhead Cost Applied"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="purchaseVarianceAccount"
                      label="Purchase Variance"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="inventoryAdjustmentVarianceAccount"
                      label="Inventory Adjustment"
                      options={incomeStatementAccountOptions}
                    />

                    <Select
                      name="materialVarianceAccount"
                      label="Material Variance"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="capacityVarianceAccount"
                      label="Capacity Variance"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="overheadAccount"
                      label="Overhead"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="maintenanceAccount"
                      label="Maintenance Expense"
                      options={incomeStatementAccountOptions}
                    />
                  </Grid>
                </VStack>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Fixed Assets
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="assetDepreciationExpenseAccount"
                      label="Depreciation Expense"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="assetGainsAndLossesAccount"
                      label="Gains and Losses"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="serviceChargeAccount"
                      label="Service Charges"
                      options={incomeStatementAccountOptions}
                    />
                  </Grid>
                </VStack>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Interest
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="interestAccount"
                      label="Interest"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="supplierPaymentDiscountAccount"
                      label="Supplier Payment Discounts"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="customerPaymentDiscountAccount"
                      label="Customer Payment Discounts"
                      options={incomeStatementAccountOptions}
                    />
                    <Select
                      name="roundingAccount"
                      label="Rounding Account"
                      options={incomeStatementAccountOptions}
                    />
                  </Grid>
                </VStack>
              </VStack>
            </TabPanel>
            <TabPanel>
              <VStack w="full" alignItems="start" spacing={8}>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Current Assets
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="inventoryAccount"
                      label="Inventory"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="inventoryInterimAccrualAccount"
                      label="Inventory Interim Accrual"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="workInProgressAccount"
                      label="Work in Progress (WIP)"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="receivablesAccount"
                      label="Receivables"
                      options={balanceSheetAccountOptions}
                    />

                    <Select
                      name="inventoryInvoicedNotReceivedAccount"
                      label="Inventory Invoiced Not Received"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="bankCashAccount"
                      label="Bank - Cash"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="bankLocalCurrencyAccount"
                      label="Bank - Local Currency"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="bankForeignCurrencyAccount"
                      label="Bank - Foreign Currency"
                      options={balanceSheetAccountOptions}
                    />
                  </Grid>
                </VStack>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Fixed Assets
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="assetAquisitionCostAccount"
                      label="Asset Aquisition Cost"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="assetAquisitionCostOnDisposalAccount"
                      label="Asset Cost on Disposal"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="accumulatedDepreciationAccount"
                      label="Accumulated Depreciation"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="accumulatedDepreciationOnDisposalAccount"
                      label="Accumulated Depreciation on Disposal"
                      options={balanceSheetAccountOptions}
                    />
                  </Grid>
                </VStack>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Liabilities
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    mb={4}
                    w="full"
                  >
                    <Select
                      name="prepaymentAccount"
                      label="Prepayments"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="payablesAccount"
                      label="Payables"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="inventoryReceivedNotInvoicedAccount"
                      label="Inventory Received Not Invoiced"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="inventoryShippedNotInvoicedAccount"
                      label="Inventory Shipped Not Invoiced"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="salesTaxPayableAccount"
                      label="Sales Tax Payable"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="purchaseTaxPayableAccount"
                      label="Purchase Tax Payable"
                      options={balanceSheetAccountOptions}
                    />
                    <Select
                      name="reverseChargeSalesTaxPayableAccount"
                      label="Reverse Charge Sales Tax"
                      options={balanceSheetAccountOptions}
                    />
                  </Grid>
                </VStack>
                <VStack w="full" alignItems="start" spacing={4}>
                  <Heading size="xs" color="gray.400" textTransform="uppercase">
                    Equity
                  </Heading>
                  <Grid
                    gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    w="full"
                  >
                    <Select
                      name="retainedEarningsAccount"
                      label="Retained Earnings"
                      options={balanceSheetAccountOptions}
                    />
                  </Grid>
                </VStack>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <HStack spacing={2}>
          <Submit isDisabled={isDisabled}>Save</Submit>
          <Button
            size="md"
            colorScheme="gray"
            variant="solid"
            onClick={onClose}
          >
            Cancel
          </Button>
        </HStack>
      </ValidatedForm>
    </VStack>
  );
};

export default AccountDefaultsForm;
