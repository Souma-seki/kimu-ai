import type { EntityId } from 'api/@types/brandedId';

export const getContentKey = (id: EntityId['work']): string => `works/${id}/content.txt`;

export const getImageKey = (id: EntityId['work']): string => `works/${id}/content.png`;
