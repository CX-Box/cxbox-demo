<h2 align="center">CXBOX Demo Project</h2>
<div style="background-color: #f2f2f2; order-left: 6px solid #f44336; padding: 10px"> 
<p align="center">
<h4 align="center">CXBOX - Rapid Enterprise Level Application Development Platform</h4>

<p align="center">
<a href="http://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/license-Apache%20License%202.0-blue.svg?style=flat" alt="license" title=""></a>
</p>


<div align="center">
  <h3>
    <a href="https://www.cxbox.org/" target="_blank">
      Website
    </a>
    <span> | </span>
    <a href="https://www.cxbox.org/demo/" target="_blank">
      Demo
    </a>
    <span> | </span>
    <a href="https://www.cxbox.org/doc/" target="_blank">
      Documentation
    </a>
  </h3>
</div>



<h2>Description</h2>
<p>
CXBOX main purpose is to speed up development of typical Enterprise Level Application based on Spring Boot. A fixed
contract with a user interface called [Cxbox-UI](https://github.com/CX-Box/cxbox-ui) allows backend developer to create
typical interfaces providing just Json meta files. Full set of typical Enterprise Level UI components included -
widgets, fields, layouts (views), navigation (screens).
</p>
</div>

# CXBOX Demo
## Prerequisites:

#####

* java 8+
* maven 3.6+
* node.js 14.4+
* npm 6.14+
* git
* docker
* docker-compose

## Getting started

* [download Demo](https://github.com/CX-Box/cxbox-demo) source code


* install dependencies and build back-end and front-end

```
mvn clean install -PUI
```

* start environment

```
docker-compose up -d
```

* run application

```
press green button in Application.java
```

## Usage

* Feel free to use this demo project as template to start your own projects!

## License

CXBox Demo is an open-source project with the [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) license