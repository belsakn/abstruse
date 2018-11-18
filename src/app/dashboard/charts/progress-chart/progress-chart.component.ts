import { Component, ElementRef, OnChanges, OnDestroy, SimpleChanges, Input } from '@angular/core';
import { select } from 'd3-selection';
import { pie, arc } from 'd3-shape';
import { interpolate } from 'd3-interpolate';
import { easeLinear } from 'd3-ease';
import 'd3-transition';

@Component({
  selector: 'app-progress-chart',
  templateUrl: './progress-chart.component.html',
  styleUrls: ['./progress-chart.component.sass']
})
export class ProgressChartComponent implements OnChanges, OnDestroy {
  @Input() percent: number;

  el: HTMLElement;
  pathChart: any;
  middleCount: any;
  arcLine: any;
  ratio: number;
  lastCount: number;

  constructor(private elementRef: ElementRef) {
    this.lastCount = 0;
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('percent' in changes) {
      if (!this.el && this.percent !== 0) {
        this.render();
      }

      this.animate();
    }
  }

  ngOnDestroy() { }

  render(): void {
    this.el = this.elementRef.nativeElement.querySelector('.progress-chart');
    this.ratio = this.percent / 100;
    const p = pie().value((d: any) => d).sort(null);
    const w = this.el.clientWidth;
    const h = this.el.clientHeight;

    const outerRadius = (w / 2) - 50;
    const innerRadius = 100;

    const color = ['#97D0AB', '#30D068', '#F5F5F5'];

    const svg = select(this.el)
      .append('svg')
      .attr('width', w)
      .attr('height', h);

    const g = svg
      .append('g')
      .attr('transform', `translate(${w / 2}, ${h / 2})`);

    this.createGradient(svg, color[1], color[1], 'progressGradient');

    const a = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0)
      .endAngle(2 * Math.PI);

    this.arcLine = arc()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(0);

    g.append('path')
      .attr('d', a)
      .style('fill', color[2]);

    this.pathChart = g.append('path')
      .datum({ endAngle: 0 })
      .attr('d', this.arcLine)
      .style('fill', `url(${document.location.href}#progressGradient)`);

    this.middleCount = g.append('text')
      .text((d: any) => d)
      .attr('class', 'middle-text')
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('dx', -10)
      .style('fill', color[1])
      .style('font-size', '60px');

    g.append('text')
      .text('%')
      .attr('class', 'percent')
      .attr('text-anchor', 'middle')
      .attr('dx', 45)
      .attr('dy', -10)
      .style('fill', color[1])
      .style('font-size', '30px');
  }

  arcTween = (transition: any, newAngle: number) => {
    transition.attrTween('d', (d: any) => {
      const i = interpolate(d.endAngle, newAngle);
      const iCount = interpolate(this.lastCount, this.percent);

      return (t) => {
        d.startAngle = d.endAngle;
        d.endAngle = i(t);
        this.lastCount = Math.floor(iCount(t));
        this.middleCount.text(this.lastCount);

        return this.arcLine(d);
      };
    });
  }

  animate = () => {
    if (!this.pathChart) {
      return;
    }

    this.ratio = this.percent / 100;
    this.pathChart.transition()
      .duration(500)
      .ease(easeLinear)
      .call(this.arcTween, ((2 * Math.PI)) * this.ratio);
  }

  createGradient(svg: any, color1: string, color2: string, id: string): void {
    const defs = svg.append('defs');

    const gradient = defs.append('linearGradient')
      .attr('id', id)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '50%')
      .attr('y2', '100%')
      .attr('spreadMethod', 'pad');

    gradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', color1)
      .attr('stop-opacity', 1);

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color2)
      .attr('stop-opacity', 1);
  }
}