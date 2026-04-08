export const RESOURCE_TYPES = [
  'LECTURE_HALL',
  'LAB',
  'MEETING_ROOM',
  'EQUIPMENT',
  'OUTDOOR_SPACE',
  'OTHER'
];

export const formatResourceType = (type) => type.replace(/_/g, ' ');
