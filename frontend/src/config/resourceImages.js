export const RESOURCE_TYPE_IMAGES = {
	LECTURE_HALL: {
		url: 'https://i.pinimg.com/736x/54/67/34/546734b3c594ab28257ed918cd2c86b3.jpg',
		description: 'Lecture hall'
	},
	LAB: {
		url: 'https://i.pinimg.com/736x/ec/03/10/ec03109be16ffeec998f861abc22e414.jpg',
		description: 'Laboratory'
	},
	MEETING_ROOM: {
		url: 'https://i.pinimg.com/736x/e6/45/59/e645595ca5dd702734e902c3192b4c7c.jpg',
		description: 'Meeting room'
	},
	EQUIPMENT: {
		url: 'https://i.pinimg.com/1200x/06/0e/97/060e9752c00c32dc19a4fbfc5a4f92e6.jpg',
		description: 'Equipment'
	},
	OUTDOOR_SPACE: {
		url: 'https://i.pinimg.com/webp70/1200x/8e/03/23/8e0323598916415cd676cf6022ff5f52.webp',
		description: 'Outdoor space'
	},
	OTHER: {
		url: 'https://i.pinimg.com/736x/f9/bf/f8/f9bff85afbd0c96cf28129f092aa31ed.jpg',
		description: 'Other resource'
	}
};

export const getResourceTypeImage = (type) => {
	return RESOURCE_TYPE_IMAGES[type] || RESOURCE_TYPE_IMAGES.OTHER;
};
