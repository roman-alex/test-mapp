import {Component, OnInit} from '@angular/core';
import {apply} from 'ol-mapbox-style';
import Feature from 'ol/Feature';
import {fromLonLat, transform} from 'ol/proj';
import Point from 'ol/geom/Point';
import {Icon, Style} from 'ol/style';
import {Vector as VectorLayer} from 'ol/layer';
import VectorSource from 'ol/source/Vector';
import {NgForm} from '@angular/forms';
import {images} from './images';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  map;
  mapExtent;

  submit(form: NgForm) {
    if (form.value.count > 0) {
      const points = [];

      if (!this.mapExtent) {
        this.mapExtent = this.map.getView().calculateExtent(this.map.getSize());
      }

      for (let i = 0; i < form.value.count; i++) {
        const point = this.generateIcon();
        points.push(point);
      }

      const vectorSource = new VectorSource({
        features: points
      });

      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });

      this.map.addLayer(vectorLayer);
      vectorLayer.setZIndex(4);

    } else {
      alert('Значение меньше 0!');
    }
    form.reset();
  }

  generateIcon() {
    const coord = [this.getRandom(this.mapExtent[0], this.mapExtent[2]), this.getRandom(this.mapExtent[1], this.mapExtent[3])];
    const coordTransform = transform(coord, 'EPSG:3857', 'EPSG:4326');

    const point = new Feature({
      geometry: new Point(fromLonLat(coordTransform))
    });

    point.setStyle(new Style({
      image: new Icon(({
        color: this.randomRgb(),
        src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(this.getIcon()),
        imgSize: [60, 60]
      }))
    }));

    return point;
  }

  randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    rand = Math.round(rand);
    return rand;
  }

  getRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  randomRgb() {
    return `rgb(${this.randomInteger(0, 255)}, ${this.randomInteger(0, 255)}, ${this.randomInteger(0, 255)})`;
  }

  getIcon() {
    const showFooter = `${this.randomInteger(0, 1) ? '' : '.footer{display:none;}'}`;
    const strokeWidth = `.circle, .footer{ stroke-width:${this.randomInteger(5, 30)}px;}`;
    const stroke = `.circle{fill:#fff; stroke:${this.randomRgb()};} .footer{stroke:${this.randomRgb()};}`;
    const style = `<style type="text/css">${stroke}${strokeWidth}${showFooter}</style>`;
    const markerNum = this.randomInteger(0, 1);
    const marker = images.markers[markerNum];
    let icon = images.icons[this.randomInteger(0, 7)];
    if (markerNum === 0) {
      icon = icon.replace(/<g>/gi, `<g style="fill:${this.randomRgb()};" transform="translate(-52 135)">`);
    } else {
      icon = icon.replace(/<g>/gi, `<g style="fill:${this.randomRgb()};">`);
    }
    const val = marker.replace(/xml:space="preserve">/gi, 'xml:space="preserve">' + style)
      .replace(/<path class="footer"/gi, icon + '<path class="footer"');
    return val;
  }

  ngOnInit() {
    this.map = apply('map', 'https://maps.tilehosting.com/styles/basic/style.json?key=BuNi4FPIgsaSVnVlaLoQ');
  }
}
