const WORDS_PER_MINUTE = 200;
const HTML_TAG_REGEX = /<\/?[^>]+(>|$)/g;
const WORD_SPLIT_REGEX = /\s/g;

export function getReadingTime(content: string) {
	const cleanContent = content.replace(HTML_TAG_REGEX, "");
	const numberOfWords = cleanContent.split(WORD_SPLIT_REGEX).length;

	return Math.ceil(numberOfWords / WORDS_PER_MINUTE);
}
