export interface VectorDocMetadata {
  sourceId: string;
}

type VectorDocMetadataKey = "sourceId";

export type VectorMetadataFilter = Record<
  VectorDocMetadataKey,
  | {
      $in: string[];
    }
  | {
      $eq: string;
    }
>;
