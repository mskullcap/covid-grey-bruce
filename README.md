I created this project as an excuse so I could play with a number of technologies, notably:

* [observablehq.com](https://observablehq.com/@mskullcap/kincardinestrong) for prototyping
* [svelte](https://svelte.dev/) for the front end
* [tachyons](https://tachyons.io/) for css
* [snowpack](https://www.snowpack.dev/) for front end bundling
* [vega-lite](https://vega.github.io/vega-lite/) for data visualizations
* [github actions](https://github.com/features/actions) for automated downloads of data
* [vercel](https://vercel.com/) for hosting

Covid-19 is on everyone's minds, and so I thought I would build a dashboard that displays my local area's 
(Grey & Bruce counties in Ontario, Canada) covid stats.  My data for the dashboard comes from the 
[Grey-Bruce Health Unit](https://www.publichealthgreybruce.on.ca/).

### See it in action here: https://gbhstrong.mysterious.cloud/

---
## Development Notes

### Generating optimized TopoJSON

For the map visualization, I downloaded GeoJSON for the counties from 
[Ontario's GeoHub](https://geohub.lio.gov.on.ca/datasets/64fb702e16204c3e88b528d9759f1174_14?geometry=-89.329%2C43.166%2C-72.025%2C45.906). [This is the link I used](https://opendata.arcgis.com/datasets/64fb702e16204c3e88b528d9759f1174_14.geojson?where=%20(UPPER_TIER_MUNICIPALITY%20%3D%20'COUNTY%20OF%20BRUCE'%20OR%20UPPER_TIER_MUNICIPALITY%20%3D%20'COUNTY%20OF%20GREY')
) to download the GeoJSON file filtered on Grey and Bruce counties.  I then dropped the file
into [mapshaper](https://mapshaper.org/) and further filtered the topology with:
```
filter 'MUNICIPAL_AREA_EXTENT_TYPE != "Water"'
```
and simplified the geometry to about 0.9%:

![](Screen%20Shot%202021-01-05%20at%209.56.02%20AM.png)

Finally, I exported the file in TopoJSON format.