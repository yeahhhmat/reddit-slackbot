import { BlockInterface } from '../lib/types';
import { timeSince } from './timeSince';

export const buildingBlocks = ({ introBlocks, data }: any) => {
  // init with incoming data
  let blocks = [...introBlocks];

  // limited to 50 blocks
  // we send 2 blocks per item
  const limit = data.children.splice(0, 10);

  // building dynamic blocks
  limit.forEach(({ data }: any) => {
    // Keeping it PG
    if (!data.over_18) {
      // Create a new JavaScript Date object based on the timestamp
      // multiplied by 1000 so that the argument is in milliseconds, not seconds.
      const currentDate = new Date();
      const dateCreated = new Date(data.created_utc * 1000);

      const viewOnReddit = `https://reddit.com/r/${
        data.subreddit
      }/comments/${data.name.slice(3)}/${data.title
        .replace('-', '')
        .replace(/\s+/g, '_')
        .toLowerCase()}`;

      const cardAuthor = `https://reddit.com/user/${data.author}`;

      let text = '';
      // slack limits to 3001 chars
      // if description is longer than 268 chars truncate
      if (data.selftext.length > 268) {
        const truncate = data.selftext.slice(0, 268);
        text += truncate + '...';
      } else {
        text += data.selftext;
      }

      // base card
      const cardInfo: BlockInterface = {
        type: 'section',
        block_id: `${data.subreddit}-${data.name}-${
          data.title.replace(/\s+/g, '_').toLowerCase().slice(0, 20) || ''
        }`,
        text: {
          type: 'mrkdwn',
          text: `*${data.title.replace(
            /[\d\w]{25}/,
            '...',
          )}*\nu/${data.author.replace(/[\d\w]{25}/, '...')} · ${timeSince(
            currentDate,
            dateCreated,
          )} · :thumbsup: ${data.score}`,
        },
      };

      const card: BlockInterface = {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${
            data.url_overridden_by_dest === undefined
              ? '\n\n' + text
              : '\n\n' + data.url_overridden_by_dest
          }`,
        },
      };

      // optional thumbnail
      const thumbnail: {
        type: string;
        image_url: any;
        alt_text: any;
      } = {
        type: 'image',
        image_url: data.thumbnail,
        alt_text:
          data.title.length < 25
            ? data.title.replace(/[\d\w\W]{25}/, '...')
            : data.title,
      };

      // if thumbnail exists set card with image
      // else send text only
      data.thumbnail === '' ? card : (card.accessory = thumbnail);

      blocks.push(cardInfo);
      // push UI component
      blocks.push(card);
      // push divider
      blocks.push({
        type: 'divider',
      });
    }
  });

  return blocks;
};
