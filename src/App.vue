<template>
  <div class="layout">
    <AppHeader title="Other Realm" />
    <var-space justify="space-around" size="large">
      <var-card title="Raids" class="card">
        <template #description>
          <div class="card-description">
            <var-select :placeholder="`${star}${t}`" v-for="t in tiers" v-model="selected[t]">
              <template #selected>
                <var-icon class="append-icon" :size="48" :name="`${static_url}${raids[t][selected[t]]['icon']}`" />
                <span>
                  {{ raids[t][selected[t]]['name'][lang] }}
                  <br>
                  HP: {{ raids[t][selected[t]]['hp'] }}
                </span>
              </template>
              <var-option v-for="(r, key) in raids[t]" :label="r['name'][lang]" :value="key">
                <var-icon class="append-icon" :size="24" :name="`${static_url}${r['icon']}`" />
                <span>{{ r['name'][lang] }}</span>
              </var-option>
            </var-select>
          </div>
        </template>
        <template #extra>
          <var-button text type="primary" @click="previewImage"> {{ preview_button }} </var-button>
          <var-button text type="primary" @click="downloadImage"> {{ generate_button }} </var-button>
        </template>
      </var-card>
    </var-space>
  </div>
</template>

<script setup>
import raids from './assets/json/raid-hp.json';
import { fabric } from 'fabric';
import { ImagePreview } from '@varlet/ui';
</script>

<script>
const star = '★';
const static_url = 'https://playorna.com/static';
const tiers = Array.from(Array(7).keys(), (x) => (x + 4).toString());
const preview_button = '预览';
const generate_button = '下载';
const realm = '重生界门';
const sign = 'Generate from https://realm.fqegg.top'

export default {
  data() {
    return {
      lang: 'zh-hans',
      selected: Object.fromEntries(tiers.map((x) => [x, null])),
      canvas: null,
    }
  },
  methods: {
    async generateImage() {
      const WIDTH = 400;
      const HEIGHT = 400;
      const titleFontSize = 16;
      const bgColor = '#616161';
      const fgColor = '#3E2723';
      const fontColor = 'white';
      this.canvas = new fabric.Canvas('canvas', {
        backgroundColor: bgColor,
        width: WIDTH,
        height: HEIGHT,
      });

      const titleTop = 26;

      async function fabricImageFromURL(image_url) {
        return new Promise(function (resolve, reject) {
          try {
            fabric.Image.fromURL(image_url, function (image) {
              resolve(image);
            }, { crossOrigin: 'anonymous' });
          } catch (error) {
            reject(error);
          }
        });
      }

      for (const [index, t] of tiers.entries()) {
        const shadow = new fabric.Shadow({
          color: "black",
          blur: 2,
          offsetX: 1,
          offsetY: 2,
        });
        const RECTHEIGHT = 50;
        const rect = new fabric.Rect({
          originX: 'center',
          originY: 'center',
          left: WIDTH * 0.5,
          fill: fgColor,
          width: WIDTH * 0.95,
          height: RECTHEIGHT - 18,
          shadow: shadow,
        });
        const raidTier = new fabric.Text(`${star}${t}`, {
          originX: 'left',
          originY: 'center',
          left: WIDTH * 0.15,
          fill: fontColor,
          fontSize: titleFontSize,
        });

        if (this.selected[t] == null) {
          const group = new fabric.Group([rect, raidTier], {
            top: titleTop * 2 - 10 + index * RECTHEIGHT,
            objectCaching: false,
            dirty: true,
          });
          this.canvas.add(group);
          continue;
        }

        const raidName = new fabric.Text(raids[t][this.selected[t]]['name'][this.lang], {
          originX: 'left',
          originY: 'center',
          left: WIDTH * 0.245,
          fill: fontColor,
          fontSize: titleFontSize,
        })
        const raidHP = new fabric.Text((raids[t][this.selected[t]]['hp'] * 10).toLocaleString(), {
          originX: 'right',
          originY: 'center',
          left: WIDTH * 0.95,
          fill: fontColor,
          fontSize: titleFontSize,
        })
        const group = new fabric.Group([rect, raidTier, raidName, raidHP], {
          top: titleTop * 2 - 10 + index * RECTHEIGHT,
          objectCaching: false,
          dirty: true,
        });
        this.canvas.add(group);

        const raidImg = await fabricImageFromURL(`${static_url}${raids[t][this.selected[t]]['icon']}`)
        const scale = 2;
        raidImg.filters.push(new fabric.Image.filters.Resize({
          resizeType: 'sliceHack',
          scaleX: scale,
          scaleY: scale,
        }))
        raidImg.set({
          originX: 'center',
          originY: 'center',
          top: titleTop * 2 + 4 + index * RECTHEIGHT,
          left: WIDTH * 0.085,
          objectCaching: false,
        }).scale(Math.floor(48 / raidImg.width));
        raidImg.applyFilters();
        this.canvas.add(raidImg);
        this.canvas.renderAll();
      }
      const title = new fabric.Text(realm, {
        originX: 'center',
        originY: 'center',
        left: WIDTH / 2,
        top: titleTop - 4,
        fill: fontColor,
        textAlign: 'center',
        fontSize: titleTop - 4,
        objectCaching: false,
      });
      this.canvas.add(title);
      const signText = new fabric.Text(sign, {
        originX: 'right',
        originY: 'center',
        left: WIDTH * 0.98,
        top: HEIGHT - 10,
        fill: fontColor,
        textAlign: 'center',
        fontSize: 12,
        objectCaching: false,
      });
      this.canvas.add(signText);
      const timeText = new fabric.Text((new Date().toLocaleDateString()), {
        originX: 'left',
        originY: 'center',
        left: WIDTH * 0.02,
        top: HEIGHT - 10,
        fill: fontColor,
        textAlign: 'center',
        fontSize: 12,
        objectCaching: false,
      });
      this.canvas.add(timeText);
      const dataURL = await this.canvas.toDataURL({
        format: 'png',
      });
      return dataURL;
    },
    async previewImage() {
      const dataURL = await this.generateImage();
      ImagePreview({
        images: [
          dataURL
        ],
      });
    },
    async downloadImage() {
      const dataURL = await this.generateImage();
      const link = document.createElement('a');
      link.download = 'image.png';
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  transition: background-color 0.25s, color 0.25s;
  color: var(--color-text);
  background-color: var(--color-body);
  overflow: hidden;
  margin: 0;
}

.layout {
  padding: 70px 16px;
  overflow-y: auto;
  height: 100vh;
}

.card {
  width: 300px;
  --card-footer-bottom: 50px;
  --card-footer-right: 9px;
}

.card-description {
  color: var(--card-description-color);
  font-size: var(--card-description-font-size);
  padding: var(--card-description-padding);
  margin: var(--card-description-margin);
}

.append-icon {
  margin-right: 6px;
  image-rendering: pixelated;
}
</style>