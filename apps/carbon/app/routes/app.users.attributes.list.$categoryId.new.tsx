import { useNavigate, useParams } from "@remix-run/react";
import { useRouteData } from "~/hooks";
import { AttributeForm } from "~/interfaces/Users/Attributes";
import type { AttributeDataType } from "~/interfaces/Users/types";

export default function NewAttributeRoute() {
  const { categoryId } = useParams();
  if (Number.isNaN(categoryId)) throw new Error("categoryId is not a number");

  const navigate = useNavigate();
  const onClose = () => navigate(-1);
  const attributesRouteData = useRouteData<{
    dataTypes: {
      data: AttributeDataType[] | null;
    };
  }>("/app/users/attributes");

  return (
    <AttributeForm
      initialValues={{
        name: "",
        attributeDataTypeId: undefined,
        userAttributeCategoryId: Number(categoryId),
        canSelfManage: true,
      }}
      dataTypes={attributesRouteData?.dataTypes?.data ?? []}
      onClose={onClose}
    />
  );
}
