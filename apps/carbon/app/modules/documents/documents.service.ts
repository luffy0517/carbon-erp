import type { Database } from "@carbon/database";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TypeOfValidator } from "~/types/validators";
import type { GenericQueryFilters } from "~/utils/query";
import { setGenericQueryFilters } from "~/utils/query";
import { sanitize } from "~/utils/supabase";
import type {
  documentLabelsValidator,
  documentValidator,
} from "./documents.models";

export async function deleteDocument(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  const deleteDocumentFavorites = await client
    .from("documentFavorite")
    .delete()
    .eq("documentId", id)
    .eq("userId", userId);

  if (deleteDocumentFavorites.error) {
    return deleteDocumentFavorites;
  }

  return client
    .from("document")
    .update({
      active: false,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function deleteDocumentFavorite(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  return client
    .from("documentFavorite")
    .delete()
    .eq("documentId", id)
    .eq("userId", userId);
}

export async function deleteDocumentLabel(
  client: SupabaseClient<Database>,
  id: string,
  label: string
) {
  return client
    .from("documentLabel")
    .delete()
    .eq("documentId", id)
    .eq("label", label);
}

export async function getDocument(
  client: SupabaseClient<Database>,
  documentId: string
) {
  return client.from("documents").select("*").eq("id", documentId).single();
}

export async function getDocuments(
  client: SupabaseClient<Database>,
  args: GenericQueryFilters & {
    search: string | null;
    type: string | null;
    label: string | null;
    favorite?: boolean;
    recent?: boolean;
    createdBy?: string;
    active: boolean;
  }
) {
  let query = client
    .from("documents")
    .select("*", {
      count: "exact",
    })
    .eq("active", args.active);

  if (args?.search) {
    query = query.or(
      `name.ilike.%${args.search}%,description.ilike.%${args.search}%`
    );
  }

  if (args?.type && args.type !== "all") {
    if (args.type === "image") {
      query = query.or("type.eq.png,type.eq.jpg,type.eq.jpeg,type.eq.gif");
    }

    if (args.type === "document") {
      query = query.or(
        "type.eq.pdf,type.eq.doc,type.eq.docx,type.eq.txt,type.eq.rtf"
      );
    }

    if (args.type === "presentation") {
      query = query.or("type.eq.ppt,type.eq.pptx");
    }

    if (args.type === "spreadsheet") {
      query = query.or("type.eq.xls,type.eq.xlsx");
    }

    if (args.type === "video") {
      query = query.or(
        "type.eq.mp4,type.eq.mov,type.eq.avi,type.eq.wmv,type.eq.flv,type.eq.mkv"
      );
    }

    if (args.type === "audio") {
      query = query.or(
        "type.eq.mp3,type.eq.wav,type.eq.wma,type.eq.aac,type.eq.ogg,type.eq.flac"
      );
    }
  }

  if (args.label) {
    query = query.contains("labels", [args.label]);
  }

  if (args?.favorite) {
    query = query.eq("favorite", true);
  }

  if (args.createdBy) {
    query = query.eq("createdBy", args.createdBy);
  }

  if (args.recent) {
    query = query.order("lastActivityAt", { ascending: false });
  }

  query = setGenericQueryFilters(query, args);

  return query;
}

export async function getDocumentLabels(
  client: SupabaseClient<Database>,
  userId: string
) {
  return client.from("documentLabels").select("*").eq("userId", userId);
}

export async function insertDocumentFavorite(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  return client.from("documentFavorite").insert({ documentId: id, userId });
}

export async function insertDocumentLabel(
  client: SupabaseClient<Database>,
  id: string,
  label: string,
  userId: string
) {
  return client.from("documentLabel").insert({ documentId: id, label, userId });
}

export async function restoreDocument(
  client: SupabaseClient<Database>,
  id: string,
  userId: string
) {
  return client
    .from("document")
    .update({
      active: true,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function upsertDocument(
  client: SupabaseClient<Database>,
  document:
    | (Omit<TypeOfValidator<typeof documentValidator>, "id"> & {
        path: string;
        size: number;
        createdBy: string;
      })
    | (Omit<TypeOfValidator<typeof documentValidator>, "id"> & {
        id: string;
        updatedBy: string;
      })
) {
  if ("createdBy" in document) {
    return client.from("document").insert(document).select("id").single();
  }
  return client
    .from("document")
    .update(
      sanitize({
        ...document,
        updatedAt: new Date().toISOString(),
      })
    )
    .eq("id", document.id);
}

export async function updateDocumentLabels(
  client: SupabaseClient<Database>,
  document: TypeOfValidator<typeof documentLabelsValidator> & {
    userId: string;
  }
) {
  if (!document.labels) {
    throw new Error("No labels provided");
  }

  return client
    .from("documentLabel")
    .delete()
    .eq("documentId", document.documentId)
    .eq("userId", document.userId)
    .then(() => {
      return client.from("documentLabel").insert(
        // @ts-ignore
        document.labels.map((label) => ({
          documentId: document.documentId,
          label,
          userId: document.userId,
        }))
      );
    });
}
