import { File, useNotification } from "@carbon/react";
import { useSubmit } from "@remix-run/react";
import type { ChangeEvent } from "react";
import { IoMdAdd } from "react-icons/io";
import { useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import { path } from "~/utils/path";

const DocumentCreateForm = () => {
  const notification = useNotification();
  const submit = useSubmit();
  const { supabase } = useSupabase();
  const user = useUser();

  const uploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && supabase) {
      const file = e.target.files[0];
      const fileExtension = file.name.substring(file.name.lastIndexOf(".") + 1);
      // TODO: refactor to use uuid
      const fileName = `${user.id}/${Math.random()
        .toString(32)
        .slice(2)}.${fileExtension}`;

      const fileUpload = await supabase.storage
        .from("private")
        .upload(fileName, file, {
          cacheControl: `${12 * 60 * 60}`,
          upsert: true,
        });

      if (fileUpload.error) {
        notification.copyableError(fileUpload.error, "Failed to upload file");
      }

      if (fileUpload.data?.path) {
        submitFileData({
          path: fileUpload.data.path,
          name: file.name,
          size: file.size,
        });
      }
    }
  };

  const submitFileData = ({
    path: filePath,
    name,
    size,
  }: {
    path: string;
    name: string;
    size: number;
  }) => {
    const formData = new FormData();
    formData.append("path", filePath);
    formData.append("name", name);
    formData.append("size", Math.round(size / 1024).toString());
    submit(formData, {
      method: "post",
      action: path.to.newDocument,
    });
  };

  return (
    <File leftIcon={<IoMdAdd />} onChange={uploadFile}>
      New Document
    </File>
  );
};

export default DocumentCreateForm;
