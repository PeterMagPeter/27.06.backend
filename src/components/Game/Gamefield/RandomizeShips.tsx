import { useState } from "react";

interface ICell {
    id: number;
  }

  const [layout, setLayout] = useState<Array<ICell>>(
    Array.from({ length: 100 }, (_, index) => ({
      id: index,
    }))
  );

  let ships = [5, 4, 3, 3, 2, 2];
  let shipPositions: number[];

  function getRandomIndex(shipsize: number, position: "v" | "h") {
    let index = 0;
    if (position == "h") {
      const plus = (Math.floor(Math.random() * (9 - 0 + 1)) + 0) * 10;
      index = Math.floor(Math.random() * (shipsize - 0 + 1)) + 0 + plus;
    } else {
      const max = (10 - shipsize + 1) * 10;
      index = Math.floor(Math.random() * (max - 0 + 1)) + 0;
    }
    while (index < 0) index += 1;
    while (index > 99) index -= 1;
    return index;
  }
  /**
   *
   * @returns
   */
  function getRandomPosition(): "v" | "h" {
    return Math.random() > 0.5 ? "v" : "h";
  }

  function isValidPosition(
    index: number,
    shipsize: number,
    position: "v" | "h"
  ): boolean {
    let valid = false;
    let multiplier = 1;
    if (position == "v") multiplier = 10;
    let i = shipsize;
    for (let pos of shipPositions) {
      if (index + i * multiplier != pos) valid = true;
      else {
        valid = false;
        break;
      }
    }
    return valid;
  }

  function resetField() {
    for (let item of layout) {
      //document.getElementById(item.id.toString())!.innerHTML = "";
    }
  }

  function randomizeShips(): void {
    //reset
    resetField();
    //
    // for (let ship of ships) {
    //   let position = getRandomPosition();
    //   if (position == "h") {
    //     const index = getRandomIndex(5, position);
    //     for (let i = 0; i < ship; i++) {
    //       let cell = document.getElementById((index + i).toString());
    //       cell!.innerHTML = "X";
    //       shipPositions.push(index);
    //     }
    //     //size 5 vertical
    //   } else {
    //     let index = getRandomIndex(5, position);
    //     for (let i = 0; i < ship; i++) {
    //       let cell = document.getElementById(index.toString());
    //       cell!.innerHTML = "X";
    //       shipPositions.push(index);
    //       index += 10;
    //     }
    //   }
    // }
    //size 5 horizontal
    let position = getRandomPosition();
    let index = getRandomIndex(5, position);
    if (position == "h") {
      for (let i = 0; i < 5; i++) {
        let cell = document.getElementById((index + i).toString());
        cell!.innerHTML = "X";
        //shipPositions.push(index);
      }
      //size 5 vertical
    } else {
      for (let i = 0; i < 5; i++) {
        let cell = document.getElementById(index.toString());
        cell!.innerHTML = "X";
        //shipPositions.push(index);
        index += 10;
      }
    }
    //
    //size 4 horizontal
    position = getRandomPosition();
    index = getRandomIndex(4, position);
    if (position == "h") {
      // let i = 4;
      // while (!(index + i in shipPositions)) {
      //   i--;
      //   if (i == 0) break;
      // }
      //
      for (let i = 0; i < 4; i++) {
        let cell = document.getElementById((index + i).toString());
        if (cell!.innerHTML == "") {
          cell!.innerHTML = "X";
          index += 10;
        } else {
          i--;
          continue;
        }
      }

      //size 4 vertical
    } else {
      index = getRandomIndex(4, position);
      for (let i = 0; i < 4; i++) {
        let cell = document.getElementById(index.toString());
        if (cell!.innerHTML == "") {
          cell!.innerHTML = "X";
          index += 10;
        } else {
          i--;
          continue;
        }
      }
    }
  }