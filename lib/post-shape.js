/**
 * One definition of what a post looks like when it leaves the server.
 *
 * `likes` is stored as an array of the email addresses of everyone who liked the
 * post, and `author` is the joined user document. Returning either one raw hands
 * every caller a list of real Gmail addresses -- /api/feed already strips them,
 * /api/exp, /api/topStories and the home page did not.
 *
 * The author's own `email` is only kept where the consumer needs it to build the
 * author's public-profile link (/profile/public/<email>, a URL the site publishes
 * itself); list endpoints drop it.
 */
export function toPublicPost(doc, { viewerEmail = "", keepAuthorEmail = false, previewChars = 0 } = {}) {
  if (!doc) return doc;

  const { likes, email, author, ...rest } = doc;
  const likeList = Array.isArray(likes) ? likes : [];

  const shaped = {
    ...rest,
    likes: Array.isArray(likes) ? likes.length : Number(likes) || 0,
    liked: Boolean(viewerEmail) && likeList.includes(viewerEmail),
  };

  if (keepAuthorEmail && email) shaped.email = email;

  // Cards render two lines of body text. Shipping the whole post is pure weight:
  // the landing page carries up to 90 documents.
  if (previewChars > 0 && typeof shaped.exp_text === "string") {
    shaped.exp_text = shaped.exp_text.slice(0, previewChars);
  }

  return shaped;
}
