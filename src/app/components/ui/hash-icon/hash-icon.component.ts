import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-hash-icon',
  templateUrl: './hash-icon.component.html',
  styleUrls: ['./hash-icon.component.scss']
})
export class HashIconComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  draw() {
    //grain is basically level of detail. higher = finer.
    const grain = 5;
    const blockout = Math.random();

    console.log('draw', blockout)
    // var canvas = document.getElementById('canvas');
    // var w = canvas.width;
    // var h = canvas.width;
    // colorArray = [];

    // if (canvas.getContext) {
    //   var ctx = canvas.getContext('2d');
    //   ctx.clearRect(0,0,w,h);
    //   ctx.fillStyle = "transparent";
    //   ctx.fillRect(0,0,w,h);

    //   function randomRGB(min,max){
    //     var min = Math.ceil(min);
    //     var max = Math.floor(max);
    //     for(var i=0; i<3; i++){
    //       colorArray.push(Math.floor(Math.random() * (max - min)) + min);
    //     }
    //   }

    //   function pokeOut(){
    //     randomRGB(0,255);
    //     var posX = 0;
    //     var posY = 0;
    //     var startFillRed = colorArray[0];
    //     var startFillGreen = colorArray[1];
    //     var startFillBlue = colorArray[2];
    //     var colorRange = 5;
    //     ctx.fillStyle = "rgb(" + startFillRed + "," + startFillGreen + "," + startFillBlue + ")";

    //     for(var y=0; y<grain; y++){
    //       for(var x=0; x<grain; x++){
    //         if(blockout < .4){
    //           ctx.fillRect(posX,posY,w/grain,h/grain);
    //           ctx.fillRect(w-posX-w/grain,posY,w/grain,h/grain);
    //           posX += w/grain;
    //         }else{
    //           startFillRed -= colorRange;
    //           startFillGreen += colorRange;
    //           startFillBlue += colorRange;
    //           ctx.fillStyle = "rgb(" + startFillRed + "," + startFillGreen + "," + startFillBlue + ")";
    //           posX += w/grain;
    //         }
    //         blockout = Math.random();
    //       }
    //       posY += h/grain;
    //       posX = 0;
    //     }
    //   }
    // }
    // pokeOut();
  }

}
