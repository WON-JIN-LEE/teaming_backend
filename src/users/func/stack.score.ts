import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserStack {
  private dataSort: object;
  private scoreObj: object;
  private logger = new Logger('UserStack');

  constructor() {
    this.scoreObj = {
      1: 15,
      2: 30,
      3: 40,
      4: 50,
    };
    this.dataSort = function (a: object, b: object) {
      if (
        this.scoreObj[a['time']] + this.scoreObj[a['rate']] >
        this.scoreObj[b['time']] + this.scoreObj[b['rate']]
      )
        return -1;
      else if (
        this.scoreObj[a['time']] + this.scoreObj[a['rate']] <
        this.scoreObj[b['time']] + this.scoreObj[b['rate']]
      )
        return 1;
      else return 0;
    };
  }

  stackScore(front: object, back: object, design: object) {
    this.logger.log('stackScore start');

    const front_ab_score = front['ability'].sort(this.dataSort)[0] ?? [];
    const front_sk_score = front['skills'].sort(this.dataSort)[0] ?? [];
    const back_ab_score = back['ability'].sort(this.dataSort)[0] ?? [];
    const back_sk_score = back['skills'].sort(this.dataSort)[0] ?? [];
    const design_sk_score = design['skills'].sort(this.dataSort)[0] ?? [];

    const payload = {
      front: {
        ability: {
          name: front_ab_score.name ?? '',
          score: front_ab_score.time
            ? this.scoreObj[front_ab_score.time] +
              this.scoreObj[front_ab_score.rate]
            : -1,
        },
        skills: {
          name: front_sk_score.name ?? '',
          score: front_sk_score.time
            ? this.scoreObj[front_sk_score.time] +
              this.scoreObj[front_sk_score.rate]
            : -1,
        },
      },
      back: {
        ability: {
          name: back_ab_score.name ?? '',
          score: back_ab_score.time
            ? this.scoreObj[back_ab_score.time] +
              this.scoreObj[back_ab_score.rate]
            : -1,
        },
        skills: {
          name: back_sk_score.name ?? '',
          score: back_sk_score.time
            ? this.scoreObj[back_sk_score.time] +
              this.scoreObj[back_sk_score.rate]
            : -1,
        },
      },
      design: {
        skills: {
          name: design_sk_score.name ?? '',
          score: design_sk_score.time
            ? this.scoreObj[design_sk_score.time] +
              this.scoreObj[design_sk_score.rate]
            : -1,
        },
      },
      reliability: 50,
      cooperation: 50,
    };

    return payload;
  }
}
