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
  pipe
} from "lodash/fp";
import {
  addOne,
  minusOne,
  multiplyByTwo,
  half,
  simpleModularArithmetic,
  modularAddition,
} from "./MathUtilities"
import {
  lastTwoArrayValues,
  firstTwoArrayValues,  
} from "./ArrayUtilities";


export const totalRoundRobinRounds = minusOne;
export const totalDoubleRoundRobinRounds = pipe([minusOne, multiplyByTwo]);
export const matchesPerRoundOfRoundRobin = half;
export const totalRoundRobinMatches = pipe([
  over([totalRoundRobinRounds, matchesPerRoundOfRoundRobin]),
  spread(multiply),
]);
export const totalDoubleRoundRobinMatches = pipe([
  totalRoundRobinMatches,
  multiplyByTwo,
]);

export const firstWeekOfRoundRobinWithEvenNumberClubs = (
  clubs: number,
): [number, Array<[number, number]>] => {
  const adjustedRangeMax = multiplyByTwo(clubs) - 1;
  return [
    clubs,
    pipe([
      half,
      range(1),
      map((currentNum: number): [number, number] => {
        // check 2n+1
        const matchup = [
          simpleModularArithmetic(add(-currentNum), adjustedRangeMax, clubs),
          modularAddition(adjustedRangeMax, currentNum),
        ];
        return currentNum % 2 == 0 ? reverse(matchup) : matchup;
      }),
      concat([[0, 1]]),
    ])(clubs),
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
  return pipe([
    range(1),
    reduce(
      (rounds: Array<Array<number>>, _: number) => {
        const [firstMatch, allOtherMatches] = pipe([
          last,
          over([head, tail]),
        ])(rounds);
        return concat(rounds, [
          concat(
            [
              pipe([
                map((num: number) => (num !== 0 ? num + 1 : num)),
                reverse,
              ])(firstMatch),
            ],
            modularAdditionMapper(allOtherMatches),
          ),
        ]);
      },
      [firstRound],
    ),
  ])(totalRoundRobinRounds(clubs));
};

export const roundRobinScheduler = pipe([
  firstWeekOfRoundRobinWithEvenNumberClubs,
  everyWeekAfterFirstWeekofRoundRobin,
]);

export const doubleRoundRobinScheduler = pipe([
  roundRobinScheduler,
  (firstHalf: Array<Array<[number, number]>>): Array<Array<[number, number]>> =>
    pipe([
      pipe([
        lastTwoArrayValues,
        map(
          (round: Array<[number, number]>): Array<[number, number]> =>
            pipe([
              firstTwoArrayValues,
              map(reverse),
              concat(takeRight(round.length - 2, round)),
            ])(round),
        ),
      ]),
      concat(take(firstHalf.length - 2, firstHalf)),
    ])(firstHalf),
  (matches: Array<Array<[number, number]>>): Array<Array<[number, number]>> =>
    pipe([map(map(reverse)), concat(matches)])(matches),
]);
