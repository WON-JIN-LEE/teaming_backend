import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as iconv from 'iconv-lite';
import * as cheerio from 'cheerio';

@Injectable()
export class PortfolioScrap {
  async ogdataScrap(urlList: Array<string>): Promise<string[]> {
    const list = [];
    const len = urlList.length;
    try {
      for (let i = 0; i < len; i++) {
        // 빈문자열 건너뛰기

        if (!urlList[i]) continue;

        const ogDate = {
          title: '',
          description: '',
          imageUrl: [],
          period: '',
          url: urlList[i],
        };

        const response = await axios({
          url: urlList[i],
          method: 'GET',
          responseType: 'arraybuffer',
        });

        const contentType = response.headers['content-type'].includes('utf-8')
          ? 'utf8'
          : 'EUC-KR';
        const content = iconv.decode(response.data, contentType).toString();

        const $ = cheerio.load(content);
        $('meta').each((index, element) => {
          if ($(element).attr('property') === 'og:title') {
            ogDate['title'] = $(element).attr('content');
          }
          if ($(element).attr('property') === 'og:description') {
            ogDate['description'] = $(element).attr('content');
          }
          if ($(element).attr('property') === 'og:image') {
            ogDate['imageUrl'].push($(element).attr('content'));
          }
        });
        list.push(ogDate);
      }
      return list;
    } catch (error) {
      return list;
    }
  }
}
