---
layout: page
title: 永远遵守最佳实践
tagline: 思考，笔记和分享
---
{% include JB/setup %}

<div class="row-fluid">
  <div class="span9">
    <div>
      {% for post in site.posts %}	
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <p>
            {{ post.content | strip_html | truncatewords:75}}
        </p>
        <p>
          <a href="{{ post.url }}"><strong>阅读更多...</strong></a><br/>
        </p>
        <p>
          <strong>
            {{ post.date | date: "%B %e, %Y" }}
          </strong>
            | {{ post.category }}
            | <a href="http://zhongfox.github.com{{ post.url }}/#disqus_thread" data-disqus-identifier="{{ post.url }}">comments</a>
        </p>
        {% if forloop.last %}
        {% else %}
          <hr>
        {% endif %}
      {% endfor %}
    </div>
  </div>
  
  <div class="span3">
    <a href="categories.html"><h4>分类</h4></a>
    <div class="tag_box">
      <strong><ul>
        {% assign categories_list = site.categories %}
        {% include JB/categories_list %}
      </ul> </strong>
    </div>
  </div>

</div>
