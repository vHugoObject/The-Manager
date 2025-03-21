import {
  add,
  map,
  last,
  reduce,
  range,
  concat,
  multiply,
  spread,
  reverse,
  over,
  head,
  tail,
  take,
  takeRight,
} from "lodash/fp";
import {
  addOne,
  minusOne,
  multiplyByTwo,
  half,
  lastTwoArrayValues,
  firstTwoArrayValues,
  modularArithmetic,
  modularAddition,
} from "./CommonUtilities";
import { flowAsync } from "futil-js";

export const totalRoundRobinRounds = minusOne;
export const totalDoubleRoundRobinRounds = flowAsync(minusOne, multiplyByTwo);
export const matchesPerRoundOfRoundRobin = half;
export const totalRoundRobinMatches = flowAsync(
  over([totalRoundRobinRounds, matchesPerRoundOfRoundRobin]),
  spread(multiply),
);
export const totalDoubleRoundRobinMatches = flowAsync(
  totalRoundRobinMatches,
  multiplyByTwo,
);

export const firstWeekOfRoundRobinWithEvenNumberClubs = (
  clubs: number,
): [number, Array<[number, number]>] => {
  const adjustedRangeMax = multiplyByTwo(clubs) - 1;
  return [
    clubs,
    flowAsync(
      half,
      range(1),
      map((currentNum: number): [number, number] => {
        // check 2n+1
        const matchup = [
          modularArithmetic(add(-currentNum), adjustedRangeMax, clubs),
          modularAddition(adjustedRangeMax, currentNum),
        ];
        return currentNum % 2 == 0 ? reverse(matchup) : matchup;
      }),
      concat([[0, 1]]),
    )(clubs),
  ];
};

export const everyWeekAfterFirstWeekofRoundRobin = ([clubs, firstRound]: [
  number,
  Array<[number, number]>,
]): Array<Array<[number, number]>> => {
  const adjustedClubsCount: number = multiplyByTwo(clubs);
  const modularAdditionMapper = map(
    map((club: number): number =>
      modularAddition(adjustedClubsCount - addOne(club) - 1, club),
    ),
  );
  return flowAsync(
    range(1),
    reduce(
      (rounds: Array<Array<number>>, _: number) => {
        const [firstMatch, allOtherMatches] = flowAsync(
          last,
          over([head, tail]),
        )(rounds);
        return concat(rounds, [
          concat(
            [
              flowAsync(
                map((num: number) => (num !== 0 ? num + 1 : num)),
                reverse,
              )(firstMatch),
            ],
            modularAdditionMapper(allOtherMatches),
          ),
        ]);
      },
      [firstRound],
    ),
  )(totalRoundRobinRounds(clubs));
};

export const roundRobinScheduler = flowAsync(
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
);

export const doubleRoundRobinScheduler = flowAsync(
  roundRobinScheduler,
  (firstHalf: Array<Array<[number, number]>>): Array<Array<[number, number]>> =>
    flowAsync(
      flowAsync(
        lastTwoArrayValues,
        map(
          (round: Array<[number, number]>): Array<[number, number]> =>
            flowAsync(
              firstTwoArrayValues,
              map(reverse),
              concat(takeRight(round.length - 2, round)),
            )(round),
        ),
      ),
      concat(take(firstHalf.length - 2, firstHalf)),
    )(firstHalf),
  (matches: Array<Array<[number, number]>>): Array<Array<[number, number]>> =>
    flowAsync(map(map(reverse)), concat(matches))(matches),
);
