<template>
  <div class="layout">
    <AppHeader :title="$t('realm')" />
    <var-space justify="space-around">
      <var-card class="card">
        <template #title>
          <div class="card-title">
            <var-space justify="space-between">
              {{ $t('raids') }}
              <var-radio v-model="sw">
                <template #unchecked-icon>
                  <var-icon name="lock" size="20px"/>
                </template>
                <template #checked-icon>
                  <var-icon name="lock-outline" size="20px"/>
                </template>
                <template #default>
                </template>
              </var-radio>
            </var-space>
          </div>
        </template>
        <template #description>
          <div class="card-description">
            <var-select :placeholder="`${star}${selected[index][0]}`" v-for="([t, v], index) in selected" v-model="selected[index][1]" @change="selected[index][0]=raids[selected[index][1]]['tier']">
              <template #selected>
                <template v-if="v != null">
                  <var-icon class="append-icon" :size="48" :name="`${static_url}${raids[v]['icon']}`" />
                  <span>
                    {{ raids[v]['name'][lang] }}
                    <br>
                    <var-icon name="heart" />
                    {{ (raids[v]['hp'] * 10).toLocaleString() }}
                  </span>
                </template>
              </template>
              <template v-for="([id, tier]) in raidTier">
                <var-option v-if="sw==1 || tier == t" :label="raids[id]['name'][lang]" :value="id">
                  <var-icon class="append-icon" :size="24" :name="`${static_url}${raids[id]['icon']}`" />
                  <span>{{ raids[id]['name'][lang] }}</span>
                </var-option>
              </template>
            </var-select>
          </div>
        </template>
        <template #extra>
          <var-button text type="primary" @click="previewImage"> {{ $t('preview_button') }} </var-button>
          <var-button text type="primary" @click="downloadImage"> {{ $t('generate_button') }} </var-button>
        </template>
      </var-card>
    </var-space>
  </div>
</template>

<script setup>
import raids from './assets/json/raid-hp.json';
import { fabric } from 'fabric';
import { watch } from 'vue';
import { ImagePreview } from '@varlet/ui';
</script>

<script>
const star = '★';
const static_url = 'https://playorna.com/static';
const rewrite_url = 'https://pxy.fqegg.top/static';
const tiers = Array.from(Array(7).keys(), (x) => (x + 4).toString());
const sign = 'Generated from https://realm.fqegg.top'

export default {
  mounted() {
    watch(() => this.$i18n.locale, (newVal, oldVal) => {
      this.lang = newVal;
    });
  },
  data() {
    return {
      lang: this.$i18n.locale,
      selected: tiers.map((x) => [x, null]),
      sw: 0,
      canvas: null,
    }
  },
  methods: {
    async generateImage() {
      const WIDTH = 400;
      const HEIGHT = 400;
      const titleFontSize = 16;
      const bgColor = '#455A64';
      const fgColor = '#000000';
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

      for (const [index, [tier, id]] of this.selected.entries()) {
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
          objectCaching: false,
          shadow: shadow,
        });
        const raidTier = new fabric.Text(`${star}${tier}`, {
          originX: 'left',
          originY: 'center',
          left: WIDTH * 0.15,
          fill: fontColor,
          fontSize: titleFontSize,
        });

        if (id == null) {
          const group = new fabric.Group([rect, raidTier], {
            top: titleTop * 2 - 10 + index * RECTHEIGHT,
            objectCaching: false,
            dirty: true,
          });
          this.canvas.add(group);
          continue;
        }

        const raidName = new fabric.Text(raids[id]['name'][this.lang], {
          originX: 'left',
          originY: 'center',
          left: WIDTH * 0.245,
          fill: fontColor,
          fontSize: titleFontSize,
        })
        const raidHP = new fabric.Text((raids[id]['hp'] * 10).toLocaleString(), {
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

        const raidImg = await fabricImageFromURL(`${rewrite_url}${raids[id]['icon']}`)
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
      const title = new fabric.Text(this.$t('realm'), {
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
  },
  computed: {
    raidTier() {
      return Object.entries(raids).map(([k, v]) => [k, v['tier']]);
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
}

.card-title {
  color: var(--card-title-color);
  font-size: var(--card-title-font-size);
  padding: var(--card-title-padding);
  margin: var(--card-title-margin);
}

.card-description {
  color: var(--card-description-color);
  font-size: var(--card-description-font-size);
  padding: var(--card-description-padding);
  margin: 8px 0 0 0;
}

.append-icon {
  margin-right: 6px;
  image-rendering: pixelated;
}
</style>
